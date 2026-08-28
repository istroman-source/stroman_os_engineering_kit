"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  cameraProjectionData,
  LOCATION_RENDERER_VERSION,
  lookAtQuaternion,
} from "@/domain/creative";
import type {
  LocationCameraState,
  LocationReconstructionView,
  LocationWorkspaceState,
  SpatialBounds,
  SpatialPoint,
} from "@/domain/creative";
import { prepareInteriorMaterials } from "@/infrastructure/spatial/prepare-interior-materials";
import { friendlyError } from "@/ui/auth/api-client";
import { Button } from "@/ui/primitives/button";

const aspectSize = (aspect: "16:9" | "9:16") =>
  aspect === "16:9" ? { width: 960, height: 540 } : { width: 540, height: 960 };

function disposeThreeScene(scene: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => {
      materials.add(material);
      Object.values(material as unknown as Record<string, unknown>).forEach((value) => {
        if (value instanceof THREE.Texture) textures.add(value);
      });
    });
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

export function cameraTechnicalData(camera: LocationCameraState) {
  const projection = cameraProjectionData(camera);
  return {
    gate: { width: projection.gateWidthMm, height: projection.gateHeightMm },
    horizontalFov: projection.horizontalFovDegrees,
    verticalFov: projection.verticalFovDegrees,
    distance: projection.targetDistanceMeters,
  };
}

export function locationReconstructionProgress(
  job: LocationReconstructionView,
  now = Date.now(),
): string {
  const elapsedMinutes = Math.max(0, Math.floor((now - Date.parse(job.createdAt)) / 60_000));
  const completion = job.percent === null ? "" : ` ${job.percent}% complete.`;
  if (job.status === "SUBMITTING" || job.phase === "UPLOADING") {
    return `${job.photoCount} source photos are preserved. Stroman is receiving the room capture.`;
  }
  if (job.phase === "QUEUED") {
    return `${job.photoCount} source photos are preserved. Upload is complete and the room has been waiting ${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} for the connected Mac. Stroman is checking automatically—no reload is needed.`;
  }
  const stages: Partial<Record<NonNullable<LocationReconstructionView["phase"]>, string>> = {
    ALIGNING: "recovering camera positions and connecting overlapping views",
    DENSIFYING: "turning the aligned views into dense room geometry",
    MESHING: "building and simplifying the room surface",
    TEXTURING: "projecting the source photographs onto the room surface",
    PACKAGING: "validating and preparing the room for the browser",
  };
  const stage = job.phase ? stages[job.phase] : undefined;
  if (stage) {
    return `${job.photoCount} source photos are preserved. Stroman is ${stage}.${completion} No reload is needed.`;
  }
  if (elapsedMinutes >= 30) {
    return `${job.photoCount} source photos are preserved. The room is still being reconstructed after ${elapsedMinutes} minutes, beyond the usual 20–30 minute intensive-scan window. Stroman will keep checking and activate it automatically—do not resubmit this scan.`;
  }
  return `${job.photoCount} source photos are preserved. The service is aligning the overlapping views and building the textured room. This can take 20–30 minutes for an intensive scan.`;
}

function pointInside(point: SpatialPoint, bounds: SpatialBounds): boolean {
  return (
    point.x >= bounds.min.x &&
    point.x <= bounds.max.x &&
    point.y >= bounds.min.y &&
    point.y <= bounds.max.y &&
    point.z >= bounds.min.z &&
    point.z <= bounds.max.z
  );
}

function clampPoint(point: SpatialPoint, bounds: SpatialBounds): SpatialPoint {
  return {
    x: Math.max(bounds.min.x, Math.min(bounds.max.x, point.x)),
    y: Math.max(bounds.min.y, Math.min(bounds.max.y, point.y)),
    z: Math.max(bounds.min.z, Math.min(bounds.max.z, point.z)),
  };
}

function currentCamera(workspace: LocationWorkspaceState): LocationCameraState {
  return workspace.activeAspect === "16:9"
    ? workspace.compositions.horizontal
    : workspace.compositions.vertical;
}

function replaceCamera(
  workspace: LocationWorkspaceState,
  camera: LocationCameraState,
): LocationWorkspaceState {
  return workspace.activeAspect === "16:9"
    ? { ...workspace, compositions: { ...workspace.compositions, horizontal: camera } }
    : { ...workspace, compositions: { ...workspace.compositions, vertical: camera } };
}

export function LocationPhotoInput({
  busy,
  onGet,
  onStart,
  onRefresh,
  onRetry,
}: {
  busy: boolean;
  onGet: () => Promise<LocationReconstructionView | null>;
  onStart: (input: {
    readonly name: string;
    readonly photos: readonly File[];
    readonly onProgress?: (uploaded: number, total: number) => void;
  }) => Promise<LocationReconstructionView>;
  onRefresh: (id: string) => Promise<LocationReconstructionView>;
  onRetry: (id: string) => Promise<LocationReconstructionView>;
}) {
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<readonly File[]>([]);
  const [job, setJob] = useState<LocationReconstructionView | null>(null);
  const [working, setWorking] = useState(false);
  const [checking, setChecking] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ uploaded: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const onGetRef = useRef(onGet);
  const onRefreshRef = useRef(onRefresh);
  const refreshInFlightRef = useRef<Promise<LocationReconstructionView> | null>(null);

  useEffect(() => {
    onGetRef.current = onGet;
    onRefreshRef.current = onRefresh;
  }, [onGet, onRefresh]);

  const refreshJob = useCallback(async (id: string) => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;
    const request = onRefreshRef.current(id);
    refreshInFlightRef.current = request;
    try {
      return await request;
    } finally {
      if (refreshInFlightRef.current === request) refreshInFlightRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    void onGetRef
      .current()
      .then((loaded) => {
        if (active) setJob(loaded);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const pollJobId =
    job && (job.status === "PROCESSING" || job.status === "SUBMITTING") ? job.id : null;

  useEffect(() => {
    if (!pollJobId) return;
    let active = true;
    let timer: number | null = null;
    let refreshRunning = false;
    const refresh = async () => {
      if (refreshRunning) return;
      if (document.visibilityState === "hidden" || !navigator.onLine) {
        timer = window.setTimeout(() => void refresh(), 5_000);
        return;
      }
      refreshRunning = true;
      try {
        const next = await refreshJob(pollJobId);
        if (active) {
          setJob(next);
          setLastCheckedAt(new Date());
          setError(null);
        }
      } catch (caught) {
        if (active) setError(friendlyError(caught));
      } finally {
        refreshRunning = false;
        if (active) timer = window.setTimeout(() => void refresh(), 8_000);
      }
    };
    const resume = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      if (timer !== null) window.clearTimeout(timer);
      void refresh();
    };
    void refresh();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => {
      active = false;
      if (timer !== null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
    };
  }, [pollJobId, refreshJob]);

  const checkNow = async (id: string) => {
    setChecking(true);
    setError(null);
    try {
      setJob(await refreshJob(id));
      setLastCheckedAt(new Date());
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setChecking(false);
    }
  };

  const retry = async (id: string) => {
    setRetrying(true);
    setError(null);
    try {
      setJob(await onRetry(id));
      setLastCheckedAt(new Date());
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setRetrying(false);
    }
  };

  const submit = async () => {
    if (!name.trim() || photos.length < 20 || photos.length > 40) return;
    if (photos.some((photo) => photo.size === 0 || photo.size > 8 * 1024 * 1024)) {
      setError("Every location photo must be no larger than 8 MB.");
      return;
    }
    if (photos.reduce((total, photo) => total + photo.size, 0) > 180 * 1024 * 1024) {
      setError("The full location photo set must be no larger than 180 MB.");
      return;
    }
    setWorking(true);
    setUploadProgress({ uploaded: 0, total: photos.length });
    setError(null);
    try {
      setJob(
        await onStart({
          name: name.trim(),
          photos,
          onProgress: (uploaded, total) => setUploadProgress({ uploaded, total }),
        }),
      );
      setPhotos([]);
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setWorking(false);
      setUploadProgress(null);
    }
  };

  const active = job?.status === "SUBMITTING" || job?.status === "PROCESSING";
  return (
    <section className="bg-card rounded-lg border p-5" aria-labelledby="build-space-heading">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Space</p>
      <h2 id="build-space-heading" className="mt-1 text-lg font-semibold">
        Build the actual room from photos
      </h2>
      <p className="text-muted-foreground mt-1 max-w-3xl text-sm">
        Photograph the room from overlapping angles. Stroman connects them into a textured space and
        estimates scale automatically—no dimensions or separate scanning software.
      </p>

      {active ? (
        <div className="mt-4 rounded-md border border-amber-600/30 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold">Building {job.name}</p>
          <p className="text-muted-foreground mt-1 text-sm" role="status" aria-live="polite">
            {locationReconstructionProgress(job)}
          </p>
          <p className="text-muted-foreground mt-2 text-xs" aria-live="polite">
            {checking
              ? "Checking the room build now…"
              : lastCheckedAt
                ? `Last status check at ${lastCheckedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}.`
                : "Connecting to live progress…"}
          </p>
          <Button
            className="mt-3"
            type="button"
            size="sm"
            variant="outline"
            disabled={working || checking}
            onClick={() => void checkNow(job.id)}
          >
            {checking ? "Checking…" : "Check now"}
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Location name</span>
              <input
                className="border-input bg-background w-full rounded-md border px-3 py-2"
                value={name}
                maxLength={160}
                onChange={(event) => setName(event.target.value)}
                placeholder="Office / kitchen"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">20–40 overlapping photos</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPhotos(Array.from(event.target.files ?? []).slice(0, 40))
                }
              />
              <span className="text-muted-foreground mt-1 block text-xs">
                {photos.length}/40 selected · JPEG or PNG · 8 MB each
              </span>
            </label>
          </div>
          <div className="text-muted-foreground mt-4 grid gap-2 text-xs sm:grid-cols-3">
            <span className="rounded-md border p-3">
              Walk the perimeter with roughly 70% overlap.
            </span>
            <span className="rounded-md border p-3">
              Include floor, ceiling, doors, and every corner.
            </span>
            <span className="rounded-md border p-3">
              Keep lighting steady and people out of frame.
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={busy || working || !name.trim() || photos.length < 20}
              onClick={() => void submit()}
            >
              {working && uploadProgress
                ? uploadProgress.uploaded < uploadProgress.total
                  ? `Uploading photo ${uploadProgress.uploaded + 1} of ${uploadProgress.total}…`
                  : "Starting room build…"
                : "Build this space"}
            </Button>
            <span className="text-muted-foreground text-xs">
              Photos are preserved privately in this project and used only to build this room. Exact
              measurements activate only when capture evidence supports them; otherwise scale stays
              clearly estimated.
            </span>
          </div>
        </>
      )}
      {job && !active && job.status !== "SUCCEEDED" ? (
        <div className="border-destructive/30 mt-3 rounded-md border p-3 text-sm">
          <p role="status" className="text-destructive">
            This room build did not complete. Your original photos remain preserved in this project.
          </p>
          {job.status === "FAILED" && job.photoCount >= 20 && job.photoCount <= 40 ? (
            <Button
              className="mt-3"
              type="button"
              size="sm"
              variant="outline"
              disabled={busy || working || checking || retrying}
              onClick={() => void retry(job.id)}
            >
              {retrying ? "Retrying preserved photos…" : "Retry using preserved photos"}
            </Button>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function LocationScanInput({
  busy,
  compact = false,
  onUpload,
}: {
  busy: boolean;
  compact?: boolean;
  onUpload: (input: {
    file: File;
    name: string;
    sourceKind: "PHONE_SCAN" | "PHOTOGRAMMETRY" | "ROOMPLAN" | "OTHER";
    unit: "METERS" | "CENTIMETERS" | "MILLIMETERS";
    metricScale: boolean;
  }) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [sourceKind, setSourceKind] = useState<
    "PHONE_SCAN" | "PHOTOGRAMMETRY" | "ROOMPLAN" | "OTHER"
  >("PHONE_SCAN");
  const [unit, setUnit] = useState<"METERS" | "CENTIMETERS" | "MILLIMETERS">("METERS");
  const [metricScale, setMetricScale] = useState(false);
  const submit = async () => {
    if (!file || !name.trim()) return;
    await onUpload({ file, name: name.trim(), sourceKind, unit, metricScale });
    setFile(null);
  };
  return (
    <div className={compact ? "space-y-3" : "bg-card rounded-lg border p-5"}>
      {!compact ? (
        <>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Space
          </p>
          <h2 className="mt-1 text-lg font-semibold">Enter the actual location</h2>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm">
            Export a textured GLB from a phone scan. Stroman keeps the original file, checks its
            scale and boundaries, and uses it for the camera view—no hand-built room required.
          </p>
        </>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Location name</span>
          <input
            className="border-input bg-background w-full rounded-md border px-3 py-2"
            value={name}
            maxLength={160}
            onChange={(event) => setName(event.target.value)}
            placeholder="Office / kitchen"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Capture source</span>
          <select
            className="border-input bg-background w-full rounded-md border px-3 py-2"
            value={sourceKind}
            onChange={(event) => setSourceKind(event.target.value as typeof sourceKind)}
          >
            <option value="PHONE_SCAN">Phone scan</option>
            <option value="ROOMPLAN">RoomPlan</option>
            <option value="PHOTOGRAMMETRY">Photogrammetry</option>
            <option value="OTHER">Other GLB export</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Export unit</span>
          <select
            className="border-input bg-background w-full rounded-md border px-3 py-2"
            value={unit}
            onChange={(event) => setUnit(event.target.value as typeof unit)}
          >
            <option value="METERS">Meters</option>
            <option value="CENTIMETERS">Centimeters</option>
            <option value="MILLIMETERS">Millimeters</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Textured GLB · max 100 MB</span>
          <input
            type="file"
            accept=".glb,model/gltf-binary"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setFile(event.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={metricScale}
          onChange={(event) => setMetricScale(event.target.checked)}
        />
        <span>
          I verified this exporter preserves metric scale. Leave unchecked when unsure; Stroman will
          label measurements estimated.
        </span>
      </label>
      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          disabled={busy || !file || !name.trim()}
          onClick={() => void submit()}
        >
          {busy ? "Importing location…" : "Enter scanned space"}
        </Button>
        <span className="text-muted-foreground text-xs">
          Originals remain private and project-scoped.
        </span>
      </div>
    </div>
  );
}

export function RealLocationWorkspace({
  projectId,
  initial,
  busy,
  shootingInstructions,
  onUpload,
  onGetReconstruction,
  onStartReconstruction,
  onRefreshReconstruction,
  onRetryReconstruction,
  onSave,
}: {
  projectId: string;
  initial: LocationWorkspaceState | null;
  busy: boolean;
  shootingInstructions: string;
  onUpload: Parameters<typeof LocationScanInput>[0]["onUpload"];
  onGetReconstruction: () => Promise<LocationReconstructionView | null>;
  onStartReconstruction: Parameters<typeof LocationPhotoInput>[0]["onStart"];
  onRefreshReconstruction: Parameters<typeof LocationPhotoInput>[0]["onRefresh"];
  onRetryReconstruction: Parameters<typeof LocationPhotoInput>[0]["onRetry"];
  onSave: (input: {
    workspace: LocationWorkspaceState;
    frame: Blob;
    width: number;
    height: number;
    title: string;
    technicalSummary: string;
    shootingInstructions: string;
    includesUnknownSpace: boolean;
  }) => Promise<void>;
}) {
  const [workspace, setWorkspace] = useState<LocationWorkspaceState | null>(initial);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boundaryRef = useRef<THREE.Box3Helper | null>(null);
  const dragRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const [loadState, setLoadState] = useState<"IDLE" | "LOADING" | "READY" | "FAILED">("IDLE");
  const [loadProgress, setLoadProgress] = useState(0);
  const [boundaryMessage, setBoundaryMessage] = useState("");
  const [fps, setFps] = useState<number | null>(null);
  const [unknownAcknowledged, setUnknownAcknowledged] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const activeCamera = workspace ? currentCamera(workspace) : null;
  const environment = workspace?.environment;
  const technical = useMemo(
    () => (activeCamera ? cameraTechnicalData(activeCamera) : null),
    [activeCamera],
  );
  const targetUnknown = Boolean(
    workspace &&
    activeCamera &&
    !pointInside(activeCamera.target, workspace.environment.coverage.bounds),
  );
  const reconstructionInput = (
    <LocationPhotoInput
      busy={busy}
      onGet={onGetReconstruction}
      onStart={onStartReconstruction}
      onRefresh={onRefreshReconstruction}
      onRetry={onRetryReconstruction}
    />
  );

  useEffect(() => {
    if (!environment || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171a1b);
    const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 250);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 6, 3);
    scene.add(key);
    const { min, max } = environment.coverage.bounds;
    const box = new THREE.Box3(
      new THREE.Vector3(min.x, min.y, min.z),
      new THREE.Vector3(max.x, max.y, max.z),
    );
    const helper = new THREE.Box3Helper(box, 0xe5a94f);
    helper.visible = false;
    boundaryRef.current = helper;
    scene.add(helper);
    let disposed = false;
    setLoadState("LOADING");
    setLoadProgress(0);
    new GLTFLoader().load(
      `/api/v1/projects/${encodeURIComponent(projectId)}/location-environments/${encodeURIComponent(environment.id)}/geometry`,
      (gltf) => {
        if (disposed) {
          disposeThreeScene(gltf.scene);
          return;
        }
        const transform = new THREE.Matrix4().fromArray([...environment.sourceToCanonical]);
        gltf.scene.applyMatrix4(transform);
        prepareInteriorMaterials(gltf.scene);
        scene.add(gltf.scene);
        setLoadState("READY");
        setLoadProgress(100);
      },
      (event) => {
        if (!disposed && event.total > 0)
          setLoadProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => {
        if (!disposed) setLoadState("FAILED");
      },
    );
    let frameCount = 0;
    let frameWindow = performance.now();
    let animation = 0;
    const render = (now: number) => {
      frameCount += 1;
      if (now - frameWindow >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - frameWindow)));
        frameCount = 0;
        frameWindow = now;
      }
      renderer.render(scene, camera);
      animation = requestAnimationFrame(render);
    };
    animation = requestAnimationFrame(render);
    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      disposeThreeScene(scene);
      renderer.dispose();
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, [environment, projectId]);

  useEffect(() => {
    if (!workspace || !activeCamera || !cameraRef.current || !rendererRef.current) return;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const size = aspectSize(activeCamera.aspectRatio);
    renderer.setSize(size.width, size.height, false);
    const data = cameraTechnicalData(activeCamera);
    camera.aspect = size.width / size.height;
    camera.fov = data.verticalFov;
    camera.near = activeCamera.nearMeters;
    camera.far = activeCamera.farMeters;
    camera.position.set(activeCamera.position.x, activeCamera.position.y, activeCamera.position.z);
    camera.lookAt(activeCamera.target.x, activeCamera.target.y, activeCamera.target.z);
    camera.updateProjectionMatrix();
    const { min, max } = workspace.environment.coverage.bounds;
    const edge = Math.min(
      activeCamera.position.x - min.x,
      max.x - activeCamera.position.x,
      activeCamera.position.y - min.y,
      max.y - activeCamera.position.y,
      activeCamera.position.z - min.z,
      max.z - activeCamera.position.z,
    );
    if (boundaryRef.current) boundaryRef.current.visible = edge < 0.5 || targetUnknown;
  }, [activeCamera, targetUnknown, workspace]);

  if (!workspace)
    return (
      <div className="space-y-3">
        {reconstructionInput}
        <details className="border-border bg-card rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Already have a textured 3D scan?
          </summary>
          <div className="mt-3">
            <LocationScanInput compact busy={busy} onUpload={onUpload} />
          </div>
        </details>
      </div>
    );

  const updateCamera = (next: LocationCameraState) => {
    setWorkspace((current) =>
      current ? replaceCamera(current, { ...next, confidence: "FILMMAKER_CONFIRMED" }) : current,
    );
    setSaveMessage("");
  };

  const move = (forward: number, right: number, up: number) => {
    const camera = currentCamera(workspace);
    const direction = new THREE.Vector3(
      camera.target.x - camera.position.x,
      0,
      camera.target.z - camera.position.z,
    ).normalize();
    if (!Number.isFinite(direction.x)) direction.set(0, 0, -1);
    const side = new THREE.Vector3(-direction.z, 0, direction.x);
    const delta = direction
      .multiplyScalar(forward)
      .add(side.multiplyScalar(right))
      .add(new THREE.Vector3(0, up, 0));
    const desired = {
      x: camera.position.x + delta.x,
      y: camera.position.y + delta.y,
      z: camera.position.z + delta.z,
    };
    const position = clampPoint(desired, workspace.environment.coverage.bounds);
    const clipped =
      Math.hypot(position.x - desired.x, position.y - desired.y, position.z - desired.z) > 0.001;
    setBoundaryMessage(
      clipped ? "I don't have this side of the room yet. Add another scan angle." : "",
    );
    const applied = {
      x: position.x - camera.position.x,
      y: position.y - camera.position.y,
      z: position.z - camera.position.z,
    };
    const target = {
      x: camera.target.x + applied.x,
      y: camera.target.y + applied.y,
      z: camera.target.z + applied.z,
    };
    updateCamera({
      ...camera,
      position,
      target,
      orientation: lookAtQuaternion(position, target) ?? camera.orientation,
    });
  };

  const turn = (yawDelta: number, pitchDelta = 0) => {
    const camera = currentCamera(workspace);
    const dx = camera.target.x - camera.position.x;
    const dy = camera.target.y - camera.position.y;
    const dz = camera.target.z - camera.position.z;
    const yaw = Math.atan2(dx, -dz) + yawDelta;
    const pitch = Math.max(-1.35, Math.min(1.35, Math.atan2(dy, Math.hypot(dx, dz)) + pitchDelta));
    const distance = Math.max(2, cameraTechnicalData(camera).distance);
    const target = {
      x: camera.position.x + Math.sin(yaw) * Math.cos(pitch) * distance,
      y: camera.position.y + Math.sin(pitch) * distance,
      z: camera.position.z - Math.cos(yaw) * Math.cos(pitch) * distance,
    };
    updateCamera({
      ...camera,
      target,
      orientation: lookAtQuaternion(camera.position, target) ?? camera.orientation,
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const amount = event.shiftKey ? 0.5 : 0.18;
    const moves: Record<string, [number, number, number]> = {
      w: [amount, 0, 0],
      ArrowUp: [amount, 0, 0],
      s: [-amount, 0, 0],
      ArrowDown: [-amount, 0, 0],
      a: [0, -amount, 0],
      ArrowLeft: [0, -amount, 0],
      d: [0, amount, 0],
      ArrowRight: [0, amount, 0],
    };
    const delta = moves[event.key];
    if (delta) {
      event.preventDefault();
      move(...delta);
      return;
    }
    const looks: Record<string, [number, number]> = {
      q: [-0.14, 0],
      e: [0.14, 0],
      r: [0, 0.1],
      f: [0, -0.1],
    };
    const lookDelta = looks[event.key.toLowerCase()];
    if (!lookDelta) return;
    event.preventDefault();
    turn(...lookDelta);
  };

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const camera = currentCamera(workspace);
    const dx = camera.target.x - camera.position.x;
    const dy = camera.target.y - camera.position.y;
    const dz = camera.target.z - camera.position.z;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      yaw: Math.atan2(dx, -dz),
      pitch: Math.atan2(dy, Math.hypot(dx, dz)),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const camera = currentCamera(workspace);
    const yaw = drag.yaw - (event.clientX - drag.x) * 0.005;
    const pitch = Math.max(-1.35, Math.min(1.35, drag.pitch - (event.clientY - drag.y) * 0.005));
    const distance = Math.max(2, cameraTechnicalData(camera).distance);
    const target = {
      x: camera.position.x + Math.sin(yaw) * Math.cos(pitch) * distance,
      y: camera.position.y + Math.sin(pitch) * distance,
      z: camera.position.z - Math.cos(yaw) * Math.cos(pitch) * distance,
    };
    updateCamera({
      ...camera,
      target,
      orientation: lookAtQuaternion(camera.position, target) ?? camera.orientation,
    });
  };

  const save = async () => {
    const renderer = rendererRef.current;
    if (!renderer || loadState !== "READY" || (targetUnknown && !unknownAcknowledged)) return;
    const camera = currentCamera(workspace);
    const size = aspectSize(camera.aspectRatio);
    const frame = await new Promise<Blob | null>((resolve) =>
      renderer.domElement.toBlob(resolve, "image/png"),
    );
    if (!frame) return;
    const data = cameraTechnicalData(camera);
    const technicalSummary = `${camera.focalLengthMm}mm · ${camera.aspectRatio} · ${camera.position.y.toFixed(2)}m camera height · ${data.distance.toFixed(2)}m target distance · ${data.horizontalFov.toFixed(1)}° × ${data.verticalFov.toFixed(1)}° FOV`;
    await onSave({
      workspace,
      frame,
      width: size.width,
      height: size.height,
      title: `${workspace.environment.name} · ${camera.aspectRatio} shot`,
      technicalSummary,
      shootingInstructions,
      includesUnknownSpace: targetUnknown,
    });
    setSaveMessage("Exact camera frame saved to the storyboard.");
  };

  const setAspect = (aspect: "16:9" | "9:16") => {
    setWorkspace((current) => (current ? { ...current, activeAspect: aspect } : current));
    setUnknownAcknowledged(false);
  };

  return (
    <div className="space-y-3">
      <section className="bg-card rounded-lg border p-4" aria-labelledby="real-location-space">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Space · Camera view · Shot
            </p>
            <h2 id="real-location-space" className="mt-1 text-lg font-semibold">
              {workspace.environment.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              This view is the actual perspective camera. Click-drag to look; WASD or arrows move;
              Q/E/R/F aim the camera with a keyboard.
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold">
              {workspace.environment.scaleConfidence === "OBSERVED"
                ? "Metric scan"
                : "Scale estimated"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div>
            <div
              className={`relative mx-auto overflow-hidden rounded-lg border-2 border-slate-700 bg-[#171a1b] ${workspace.activeAspect === "16:9" ? "aspect-video" : "aspect-[9/16] max-h-[44rem] max-w-[25rem]"}`}
            >
              <canvas
                ref={canvasRef}
                tabIndex={0}
                aria-label={`Actual ${workspace.activeAspect} camera view inside ${workspace.environment.name}`}
                aria-describedby="project-room-camera-help"
                className="h-full w-full cursor-crosshair touch-none outline-none focus:ring-2 focus:ring-amber-500"
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={() => (dragRef.current = null)}
                onPointerCancel={() => (dragRef.current = null)}
              />
              {loadState !== "READY" ? (
                <div className="absolute inset-0 grid place-items-center bg-black/75 p-6 text-center text-sm text-white">
                  {loadState === "FAILED"
                    ? "This scan could not be rendered. Re-export it as a textured GLB."
                    : `Entering location… ${loadProgress}%`}
                </div>
              ) : null}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="h-4 w-4 border-t border-l border-white/80" />
                <span className="absolute h-4 w-4 rotate-180 border-t border-l border-white/80" />
              </div>
              {targetUnknown ? (
                <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_12px,rgba(229,169,79,.12)_12px,rgba(229,169,79,.12)_24px)]" />
              ) : null}
            </div>
            <p id="project-room-camera-help" className="sr-only">
              Use W A S D or arrow keys to move. Use Q and E to turn, and R and F to look up or
              down.
            </p>
            {boundaryMessage || targetUnknown ? (
              <div className="mt-2 rounded-md border border-amber-600/40 bg-amber-600/10 p-3 text-sm">
                <strong>I don&apos;t have this side of the room yet.</strong>
                <span className="text-muted-foreground ml-2">
                  Add another scan angle; Stroman will not invent it.
                </span>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div>
              <p className="text-muted-foreground text-[0.68rem] font-semibold tracking-wide uppercase">
                Move through the room
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2" aria-label="Camera movement controls">
                <span />
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  aria-label="Move camera forward"
                  onClick={() => move(0.25, 0, 0)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  aria-label="Raise camera"
                  onClick={() => move(0, 0, 0.2)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  aria-label="Move camera left"
                  onClick={() => move(0, -0.25, 0)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  aria-label="Move camera backward"
                  onClick={() => move(-0.25, 0, 0)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  aria-label="Move camera right"
                  onClick={() => move(0, 0.25, 0)}
                >
                  →
                </button>
              </div>
              <button
                type="button"
                className="border-border mt-2 min-h-11 w-full rounded-md border text-sm font-semibold"
                aria-label="Lower camera"
                onClick={() => move(0, 0, -0.2)}
              >
                Lower camera
              </button>
            </div>
            <div>
              <p className="text-muted-foreground text-[0.68rem] font-semibold tracking-wide uppercase">
                Aim camera
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2" aria-label="Camera aim controls">
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  onClick={() => turn(-0.2)}
                >
                  Turn left
                </button>
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  onClick={() => turn(0.2)}
                >
                  Turn right
                </button>
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  onClick={() => turn(0, 0.14)}
                >
                  Look up
                </button>
                <button
                  type="button"
                  className="border-border min-h-11 rounded-md border text-sm font-semibold"
                  onClick={() => turn(0, -0.14)}
                >
                  Look down
                </button>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-[0.68rem] font-semibold tracking-wide uppercase">
                Composition
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["16:9", "9:16"] as const).map((aspect) => (
                  <button
                    type="button"
                    key={aspect}
                    aria-pressed={workspace.activeAspect === aspect}
                    onClick={() => setAspect(aspect)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${workspace.activeAspect === aspect ? "border-foreground bg-foreground text-background" : "border-border"}`}
                  >
                    {aspect}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Each format keeps its own camera position and aim.
              </p>
            </div>
            <label className="block text-sm">
              <span className="flex justify-between font-medium">
                <span>Lens</span>
                <span>{activeCamera!.focalLengthMm}mm</span>
              </span>
              <input
                className="mt-2 w-full"
                type="range"
                min="14"
                max="135"
                step="1"
                value={activeCamera!.focalLengthMm}
                onChange={(event) =>
                  updateCamera({ ...activeCamera!, focalLengthMm: Number(event.target.value) })
                }
              />
            </label>
            <div className="grid grid-cols-4 gap-1" aria-label="Lens presets">
              {[24, 35, 50, 85].map((focalLengthMm) => (
                <button
                  type="button"
                  key={focalLengthMm}
                  aria-label={`Set lens to ${focalLengthMm}mm`}
                  aria-pressed={activeCamera!.focalLengthMm === focalLengthMm}
                  onClick={() => updateCamera({ ...activeCamera!, focalLengthMm })}
                  className={`rounded border px-2 py-1 text-xs ${activeCamera!.focalLengthMm === focalLengthMm ? "border-foreground bg-foreground text-background" : "border-border"}`}
                >
                  {focalLengthMm}
                </button>
              ))}
            </div>
            <details className="rounded-md border p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Advanced camera</summary>
              <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Filmback</dt>
                <dd>36 × 24mm</dd>
                <dt className="text-muted-foreground">FOV</dt>
                <dd>
                  {technical!.horizontalFov.toFixed(1)}° × {technical!.verticalFov.toFixed(1)}°
                </dd>
                <dt className="text-muted-foreground">Height</dt>
                <dd>{activeCamera!.position.y.toFixed(2)}m</dd>
                <dt className="text-muted-foreground">Target</dt>
                <dd>{technical!.distance.toFixed(2)}m</dd>
                <dt className="text-muted-foreground">Framing</dt>
                <dd>
                  {activeCamera!.confidence === "FILMMAKER_CONFIRMED"
                    ? "You confirmed"
                    : "Proposed"}
                </dd>
              </dl>
            </details>
            <div className="rounded-md border p-3 text-xs">
              <p className="font-semibold">Shooting instruction</p>
              <p className="text-muted-foreground mt-1 leading-relaxed">{shootingInstructions}</p>
            </div>
            {targetUnknown ? (
              <label className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={unknownAcknowledged}
                  onChange={(event) => setUnknownAcknowledged(event.target.checked)}
                />
                <span>
                  Save with the visible unknown-area warning. The room will not be completed or
                  guessed.
                </span>
              </label>
            ) : null}
            <Button
              type="button"
              className="w-full"
              disabled={busy || loadState !== "READY" || (targetUnknown && !unknownAcknowledged)}
              onClick={() => void save()}
            >
              {busy ? "Saving exact frame…" : "Save this exact shot"}
            </Button>
            {saveMessage ? (
              <p role="status" className="text-xs font-medium text-emerald-700">
                {saveMessage}
              </p>
            ) : null}
          </aside>
        </div>

        {workspace.environment.sourcePhotos?.length ? (
          <details className="mt-5 border-t pt-4">
            <summary className="cursor-pointer text-sm font-semibold">Source photos</summary>
            <div className="mt-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="font-semibold">Photo presence · actual location</h3>
                  <p className="text-muted-foreground text-xs">
                    Source evidence preserves the room&apos;s real light, texture, color, and
                    atmosphere.
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">
                  {workspace.environment.sourcePhotos.length} photos
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {workspace.environment.sourcePhotos.slice(0, 6).map((photo, index) => (
                  <figure key={photo.mediaAssetId} className="overflow-hidden rounded-md border">
                    <Image
                      unoptimized
                      width={320}
                      height={240}
                      src={`/api/v1/projects/${encodeURIComponent(projectId)}/location-environments/${encodeURIComponent(workspace.environment.id)}/photos/${encodeURIComponent(photo.mediaAssetId)}`}
                      alt={`Actual location source angle ${index + 1}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </figure>
                ))}
              </div>
            </div>
          </details>
        ) : null}

        {workspace.savedShots.length ? (
          <div className="mt-5 border-t pt-4">
            <h3 className="font-semibold">Storyboard · saved camera views</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {workspace.savedShots.map((shot) => (
                <figure key={shot.id} className="overflow-hidden rounded-md border">
                  <Image
                    unoptimized
                    width={shot.storyboardFrame.width}
                    height={shot.storyboardFrame.height}
                    src={`/api/v1/projects/${encodeURIComponent(projectId)}/location-shots/${encodeURIComponent(shot.storyboardFrame.mediaAssetId)}`}
                    alt={`${shot.title}, exact saved camera frame`}
                    className="aspect-video w-full bg-black object-contain"
                  />
                  <figcaption className="p-3 text-xs">
                    <strong>{shot.title}</strong>
                    <span className="text-muted-foreground mt-1 block">
                      {shot.technicalSummary}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : null}

        <details className="mt-5 border-t pt-4">
          <summary className="cursor-pointer text-sm font-semibold">Room details</summary>
          <dl className="text-muted-foreground mt-3 grid gap-1 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Scale</dt>
              <dd>
                {workspace.environment.scaleConfidence === "OBSERVED" ? "Measured" : "Estimated"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Viewer</dt>
              <dd>
                Room version {workspace.environment.version} ·{" "}
                {fps ? `${fps} fps` : "checking performance"} · {LOCATION_RENDERER_VERSION}
              </dd>
            </div>
          </dl>
        </details>

        <details className="mt-5 border-t pt-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Replace or rebuild room
          </summary>
          <div className="mt-4 space-y-4">
            {reconstructionInput}
            <LocationScanInput compact busy={busy} onUpload={onUpload} />
          </div>
        </details>
      </section>
    </div>
  );
}
