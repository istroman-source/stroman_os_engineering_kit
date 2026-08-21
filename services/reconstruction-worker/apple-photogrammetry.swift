import Foundation
import RealityKit

private struct WorkerEvent: Encodable {
    let event: String
    let fraction: Double?
    let message: String?
    let usableSamples: Int?
    let totalSamples: Int?
}

private enum RunnerError: LocalizedError {
    case invalidArguments
    case invalidDetail(String)
    case unsupportedHardware
    case insufficientSamples(usable: Int, total: Int)
    case requestFailed(String)
    case missingResult

    var errorDescription: String? {
        switch self {
        case .invalidArguments:
            return "Expected an input image directory, an output directory, and an optional reduced or medium detail level."
        case .invalidDetail(let value):
            return "Unsupported Apple reconstruction detail level: \(value)."
        case .unsupportedHardware:
            return "Apple photogrammetry is not supported on this Mac."
        case .insufficientSamples(let usable, let total):
            return "Only \(usable) of \(total) source photos were usable for reconstruction."
        case .requestFailed(let message):
            return "Apple photogrammetry failed: \(message)"
        case .missingResult:
            return "Apple photogrammetry completed without producing a model."
        }
    }
}

private func emit(
    event: String,
    fraction: Double? = nil,
    message: String? = nil,
    usableSamples: Int? = nil,
    totalSamples: Int? = nil
) {
    let value = WorkerEvent(
        event: event,
        fraction: fraction,
        message: message,
        usableSamples: usableSamples,
        totalSamples: totalSamples
    )
    guard let data = try? JSONEncoder().encode(value), let line = String(data: data, encoding: .utf8)
    else { return }
    print(line)
    fflush(stdout)
}

private func sourceImageCount(at directory: URL) throws -> Int {
    let allowed = Set(["heic", "heif", "jpg", "jpeg", "png"])
    return try FileManager.default.contentsOfDirectory(
        at: directory,
        includingPropertiesForKeys: [.isRegularFileKey],
        options: [.skipsHiddenFiles]
    ).filter { allowed.contains($0.pathExtension.lowercased()) }.count
}

@main
private struct StromanApplePhotogrammetry {
    static func main() async {
        do {
            try await run()
        } catch {
            emit(event: "error", message: error.localizedDescription)
            Foundation.exit(1)
        }
    }

    private static func run() async throws {
        let arguments = CommandLine.arguments
        if arguments.count == 2 && arguments[1] == "--check" {
            guard PhotogrammetrySession.isSupported else { throw RunnerError.unsupportedHardware }
            emit(event: "supported")
            return
        }
        guard arguments.count == 3 || arguments.count == 4 else { throw RunnerError.invalidArguments }
        guard PhotogrammetrySession.isSupported else { throw RunnerError.unsupportedHardware }

        let images = URL(fileURLWithPath: arguments[1], isDirectory: true).standardizedFileURL
        let output = URL(fileURLWithPath: arguments[2], isDirectory: true).standardizedFileURL
        let detailName = arguments.count == 4 ? arguments[3].lowercased() : "reduced"
        let detail: PhotogrammetrySession.Request.Detail
        switch detailName {
        case "reduced": detail = .reduced
        case "medium": detail = .medium
        default: throw RunnerError.invalidDetail(detailName)
        }
        let totalSamples = try sourceImageCount(at: images)
        guard totalSamples >= 20 else {
            throw RunnerError.insufficientSamples(usable: totalSamples, total: totalSamples)
        }

        var configuration = PhotogrammetrySession.Configuration()
        configuration.sampleOrdering = .sequential
        configuration.featureSensitivity = .high
        configuration.isObjectMaskingEnabled = false
        configuration.ignoreBoundingBox = true

        let session = try PhotogrammetrySession(input: images, configuration: configuration)
        let request = PhotogrammetrySession.Request.modelFile(url: output, detail: detail)
        var rejectedSamples = Set<String>()
        var producedModel = false

        emit(event: "started", fraction: 0, totalSamples: totalSamples)
        try session.process(requests: [request])

        for try await result in session.outputs {
            switch result {
            case .inputComplete:
                emit(event: "inputComplete", fraction: 0.05, totalSamples: totalSamples)
            case .requestProgress(_, let fractionComplete):
                emit(event: "progress", fraction: fractionComplete, totalSamples: totalSamples)
            case .requestProgressInfo:
                continue
            case .invalidSample(let identifier, _):
                rejectedSamples.insert(String(describing: identifier))
            case .skippedSample(let identifier):
                rejectedSamples.insert(String(describing: identifier))
            case .automaticDownsampling:
                emit(event: "downsampled", message: "Source images were downsampled for this Mac.")
            case .requestComplete(_, let requestResult):
                if case .modelFile = requestResult { producedModel = true }
            case .requestError(_, let error):
                throw RunnerError.requestFailed(error.localizedDescription)
            case .processingCancelled:
                throw RunnerError.requestFailed("processing was cancelled")
            case .stitchingIncomplete:
                emit(
                    event: "warning",
                    message: "Some capture regions could not be stitched into the model."
                )
            case .processingComplete:
                let usableSamples = totalSamples - rejectedSamples.count
                let minimumUsable = max(12, Int(ceil(Double(totalSamples) * 0.6)))
                guard usableSamples >= minimumUsable else {
                    throw RunnerError.insufficientSamples(usable: usableSamples, total: totalSamples)
                }
                guard producedModel else { throw RunnerError.missingResult }
                emit(
                    event: "complete",
                    fraction: 1,
                    usableSamples: usableSamples,
                    totalSamples: totalSamples
                )
                return
            @unknown default:
                continue
            }
        }

        throw RunnerError.missingResult
    }
}
