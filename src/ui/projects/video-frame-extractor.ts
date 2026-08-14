export interface ExtractedVideoFrame {
  readonly index: number;
  readonly timestampMs: number;
  readonly blob: Blob;
}

export function sampleVideoTimestamps(durationSeconds: number, count = 5): number[] {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return [];
  const total = Math.max(2, Math.min(6, Math.floor(count)));
  const inset = Math.min(durationSeconds * 0.06, 0.25);
  const start = inset;
  const end = Math.max(start, durationSeconds - inset);
  return Array.from({ length: total }, (_, index) =>
    total === 1 ? start : start + ((end - start) * index) / (total - 1),
  );
}

function waitForMediaEvent(
  element: HTMLVideoElement,
  eventName: "loadedmetadata" | "loadeddata" | "seeked",
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("The browser could not read this video in time."));
    }, 15_000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      element.removeEventListener(eventName, onReady);
      element.removeEventListener("error", onError);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("This video format could not be read by the browser."));
    };
    element.addEventListener(eventName, onReady, { once: true });
    element.addEventListener("error", onError, { once: true });
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("A video frame could not be prepared."))),
      "image/jpeg",
      0.8,
    );
  });
}

/** Extract bounded representative JPEGs locally; the raw video never enters a client AI SDK. */
export async function extractVideoFrames(file: File, count = 5): Promise<ExtractedVideoFrame[]> {
  if (!file.type.startsWith("video/")) return [];
  const video = document.createElement("video");
  const objectUrl = URL.createObjectURL(file);
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;
  try {
    const metadataReady = waitForMediaEvent(video, "loadedmetadata");
    video.load();
    await metadataReady;
    if (!video.videoWidth || !video.videoHeight) await waitForMediaEvent(video, "loadeddata");
    const timestamps = sampleVideoTimestamps(video.duration, count);
    if (timestamps.length < 2) throw new Error("The video duration could not be read.");
    const scale = Math.min(1, 960 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The browser could not prepare video frames.");
    const frames: ExtractedVideoFrame[] = [];
    for (let index = 0; index < timestamps.length; index += 1) {
      const timestamp = timestamps[index]!;
      const seeked = waitForMediaEvent(video, "seeked");
      video.currentTime = timestamp;
      await seeked;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push({
        index,
        timestampMs: Math.round(timestamp * 1000),
        blob: await canvasBlob(canvas),
      });
    }
    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
