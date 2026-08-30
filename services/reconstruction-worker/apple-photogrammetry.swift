import Foundation
import RealityKit
import Vision

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
    case incompleteRoomCoverage
    case requestFailed(String)
    case missingResult

    var errorDescription: String? {
        switch self {
        case .invalidArguments:
            return "Expected an input image directory, an output directory, and an optional reduced, medium, or full detail level."
        case .invalidDetail(let value):
            return "Unsupported Apple reconstruction detail level: \(value)."
        case .unsupportedHardware:
            return "Apple photogrammetry is not supported on this Mac."
        case .insufficientSamples(let usable, let total):
            return "Only \(usable) of \(total) source photos were usable for reconstruction."
        case .incompleteRoomCoverage:
            return "Apple could not connect this capture into one dependable room. Take one slower overlapping walk, including the floor, ceiling, corners, and doorways, then rebuild."
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

private func sourceImageURLs(at directory: URL) throws -> [URL] {
    let allowed = Set(["heic", "heif", "jpg", "jpeg", "png"])
    return try FileManager.default.contentsOfDirectory(
        at: directory,
        includingPropertiesForKeys: [.isRegularFileKey],
        options: [.skipsHiddenFiles]
    ).filter { allowed.contains($0.pathExtension.lowercased()) }
        .sorted { $0.lastPathComponent.localizedStandardCompare($1.lastPathComponent) == .orderedAscending }
}

/**
 A close-up portrait has no stable relationship to the photographed room and
 can dominate Object Capture's matching. We retain the original evidence, but
 keep only this clearly incompatible kind of frame out of the temporary input
 directory. A small, distant face remains valid room evidence and is retained.
 */
private func containsDominantFace(_ image: URL) -> Bool {
    let request = VNDetectFaceRectanglesRequest()
    do {
        try VNImageRequestHandler(url: image, options: [:]).perform([request])
        return (request.results ?? []).contains { face in
            face.boundingBox.width * face.boundingBox.height >= 0.08
        }
    } catch {
        // Vision uncertainty must never discard source evidence. Let Apple's
        // reconstruction engine evaluate frames Vision cannot read.
        return false
    }
}

private func reconstructionInputDirectory(
    originalImages: URL,
    acceptedImages: [URL],
    excludedPortraits: Int
) throws -> (url: URL, cleanup: Bool) {
    guard excludedPortraits > 0 else { return (originalImages, false) }
    let temporaryInput = originalImages.deletingLastPathComponent()
        .appendingPathComponent("stroman-room-input-\(UUID().uuidString)", isDirectory: true)
    try FileManager.default.createDirectory(at: temporaryInput, withIntermediateDirectories: true)
    for image in acceptedImages {
        try FileManager.default.copyItem(at: image, to: temporaryInput.appendingPathComponent(image.lastPathComponent))
    }
    return (temporaryInput, true)
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
        let detailName = arguments.count == 4 ? arguments[3].lowercased() : "full"
        let detail: PhotogrammetrySession.Request.Detail
        switch detailName {
        case "reduced": detail = .reduced
        case "medium": detail = .medium
        case "full": detail = .full
        default: throw RunnerError.invalidDetail(detailName)
        }
        let sourceImages = try sourceImageURLs(at: images)
        let totalSamples = sourceImages.count
        guard totalSamples >= 20 else {
            throw RunnerError.insufficientSamples(usable: totalSamples, total: totalSamples)
        }
        let portraitImages = sourceImages.filter(containsDominantFace)
        let reconstructionImages = sourceImages.filter { image in
            !portraitImages.contains(image)
        }
        guard reconstructionImages.count >= 20 else {
            throw RunnerError.insufficientSamples(usable: reconstructionImages.count, total: totalSamples)
        }
        let reconstructionInput = try reconstructionInputDirectory(
            originalImages: images,
            acceptedImages: reconstructionImages,
            excludedPortraits: portraitImages.count
        )
        defer {
            if reconstructionInput.cleanup {
                try? FileManager.default.removeItem(at: reconstructionInput.url)
            }
        }

        var configuration = PhotogrammetrySession.Configuration()
        // File selection order is not a verified physical walk around the
        // room. Asking Object Capture to infer that order avoids false camera
        // adjacency and the warped joins it can create from arbitrary uploads.
        configuration.sampleOrdering = .unordered
        configuration.featureSensitivity = .high
        configuration.isObjectMaskingEnabled = false
        configuration.ignoreBoundingBox = true

        let session = try PhotogrammetrySession(input: reconstructionInput.url, configuration: configuration)
        let request = PhotogrammetrySession.Request.modelFile(url: output, detail: detail)
        var rejectedSamples = Set(portraitImages.map(\.lastPathComponent))
        var producedModel = false

        emit(event: "started", fraction: 0, totalSamples: totalSamples)
        if !portraitImages.isEmpty {
            emit(
                event: "filteredPortraitSamples",
                message: "Excluded \(portraitImages.count) close-up portrait \(portraitImages.count == 1 ? "frame" : "frames") from room reconstruction.",
                usableSamples: reconstructionImages.count,
                totalSamples: totalSamples
            )
        }
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
                // A mesh with unstitched regions may look complete enough to
                // display yet cannot be trusted for camera placement. Fail
                // closed, preserving the evidence so the filmmaker can retry
                // rather than quietly receiving a warped planning space.
                throw RunnerError.incompleteRoomCoverage
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
