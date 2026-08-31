"use client";

import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  renderShotPlanText,
  type SpatialSetPieceState,
  type ShotPlanningState,
  type SpatialPoint,
  type SpatialShotState,
} from "@/domain/creative";
import { Button } from "@/ui/primitives/button";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const isoPoint = (point: SpatialPoint) => ({
  x: 50 + (point.x - point.z) * 5.4,
  y: 72 + (point.x + point.z) * 2.8 - point.y * 8,
});
const groundPoint = (x: number, y: number, height: number): Pick<SpatialPoint, "x" | "z"> => {
  const diagonal = (x - 50) / 5.4;
  const depth = (y + height * 8 - 72) / 2.8;
  return { x: (diagonal + depth) / 2, z: (depth - diagonal) / 2 };
};

function points(values: readonly { x: number; y: number }[]): string {
  return values.map((point) => `${point.x},${point.y}`).join(" ");
}

function IsoSetPiece({ setPiece }: { setPiece: SpatialSetPieceState }) {
  const halfWidth = setPiece.width / 2;
  const halfDepth = setPiece.depth / 2;
  const baseY = Math.max(0, setPiece.position.y - setPiece.height);
  const base = [
    isoPoint({ x: setPiece.position.x - halfWidth, y: baseY, z: setPiece.position.z - halfDepth }),
    isoPoint({ x: setPiece.position.x + halfWidth, y: baseY, z: setPiece.position.z - halfDepth }),
    isoPoint({ x: setPiece.position.x + halfWidth, y: baseY, z: setPiece.position.z + halfDepth }),
    isoPoint({ x: setPiece.position.x - halfWidth, y: baseY, z: setPiece.position.z + halfDepth }),
  ];
  const top = [
    isoPoint({
      x: setPiece.position.x - halfWidth,
      y: setPiece.position.y,
      z: setPiece.position.z - halfDepth,
    }),
    isoPoint({
      x: setPiece.position.x + halfWidth,
      y: setPiece.position.y,
      z: setPiece.position.z - halfDepth,
    }),
    isoPoint({
      x: setPiece.position.x + halfWidth,
      y: setPiece.position.y,
      z: setPiece.position.z + halfDepth,
    }),
    isoPoint({
      x: setPiece.position.x - halfWidth,
      y: setPiece.position.y,
      z: setPiece.position.z + halfDepth,
    }),
  ];
  return (
    <g>
      <polygon
        points={points([base[0]!, base[1]!, top[1]!, top[0]!])}
        fill={setPiece.color}
        opacity=".72"
      />
      <polygon
        points={points([base[1]!, base[2]!, top[2]!, top[1]!])}
        fill={setPiece.color}
        opacity=".56"
      />
      <polygon points={points(top)} fill={setPiece.color} stroke="#34383a" strokeWidth=".35" />
    </g>
  );
}

function replacePoint(point: SpatialPoint, next: Partial<SpatialPoint>): SpatialPoint {
  return { ...point, ...next };
}

function CameraFrame({ shot, label }: { shot: SpatialShotState; label?: string }) {
  const { camera, subject } = shot;
  const vertical = camera.aspectRatio === "9:16";
  const width = vertical ? 90 : 160;
  const height = vertical ? 160 : 90;
  const projected = useMemo(() => {
    const dx = camera.target.x - camera.position.x;
    const dy = camera.target.y - camera.position.y;
    const dz = camera.target.z - camera.position.z;
    const length = Math.hypot(dx, dy, dz) || 1;
    const forward = { x: dx / length, y: dy / length, z: dz / length };
    const horizontalLength = Math.hypot(forward.x, forward.z) || 1;
    const right = { x: forward.z / horizontalLength, y: 0, z: -forward.x / horizontalLength };
    const up = {
      x: forward.y * right.z,
      y: forward.z * right.x - forward.x * right.z,
      z: -forward.y * right.x,
    };
    const fov = 2 * Math.atan(36 / (2 * camera.focalLengthMm));
    const aspect = width / height;
    const point = (world: SpatialPoint) => {
      const rx = world.x - camera.position.x;
      const ry = world.y - camera.position.y;
      const rz = world.z - camera.position.z;
      const depth = Math.max(0.3, rx * forward.x + ry * forward.y + rz * forward.z);
      const lateral = rx * right.x + ry * right.y + rz * right.z;
      const verticalOffset = rx * up.x + ry * up.y + rz * up.z;
      const x = width / 2 + (lateral / (depth * Math.tan(fov / 2))) * (width / 2);
      const y =
        height / 2 - (verticalOffset / ((depth * Math.tan(fov / 2)) / aspect)) * (height / 2);
      return { x, y, depth };
    };
    return {
      subject: point({ ...subject.position, y: subject.pose === "SEATED" ? 1.05 : 1.55 }),
      setPieces: shot.setPieces.map((setPiece) => ({
        ...setPiece,
        screen: point(setPiece.position),
      })),
    };
  }, [camera, shot.setPieces, subject, width, height]);
  const scale = clamp(82 / projected.subject.depth, 7, vertical ? 34 : 25);
  return (
    <figure className="min-w-0">
      {label ? (
        <figcaption className="mb-2 text-xs font-semibold tracking-wide uppercase">
          {label}
        </figcaption>
      ) : null}
      <div
        className={`mx-auto overflow-hidden rounded-lg border-2 border-slate-700 bg-[#dfe4dc] shadow-inner ${vertical ? "aspect-[9/16] max-h-[33rem]" : "aspect-video"}`}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label={`${camera.aspectRatio} camera view at ${camera.focalLengthMm} millimeters`}
        >
          <rect width={width} height={height} fill="#d9ded4" />
          <rect width={width} height={height} fill={shot.lightColor} opacity=".12" />
          <path
            d={`M0 ${height * 0.22}H${width} M0 ${height * 0.31}H${width} M0 ${height * 0.4}H${width}`}
            stroke="#b8c4ad"
            strokeWidth="1.2"
          />
          {projected.setPieces.map((setPiece) => {
            const unit = clamp(42 / setPiece.screen.depth, 3.5, vertical ? 13 : 10);
            const pieceWidth = clamp(setPiece.width * unit, 2, width * 0.7);
            const pieceHeight = clamp(setPiece.height * unit, 1.5, height * 0.65);
            return (
              <g key={setPiece.id}>
                <rect
                  x={setPiece.screen.x - pieceWidth / 2}
                  y={setPiece.screen.y - pieceHeight}
                  width={pieceWidth}
                  height={pieceHeight}
                  rx="1.5"
                  fill={setPiece.color}
                  stroke="#34383a"
                  strokeWidth=".5"
                />
                {pieceWidth > 12 ? (
                  <text
                    x={setPiece.screen.x}
                    y={setPiece.screen.y - pieceHeight / 2}
                    textAnchor="middle"
                    fontSize="3"
                    fill="#f8faf8"
                  >
                    {setPiece.label.slice(0, 18)}
                  </text>
                ) : null}
              </g>
            );
          })}
          <circle
            cx={projected.subject.x}
            cy={projected.subject.y - scale * 0.88}
            r={scale * 0.24}
            fill="#b98468"
            stroke="#303638"
          />
          <path
            d={`M${projected.subject.x} ${projected.subject.y - scale * 0.62}v${scale * 1.15} M${projected.subject.x} ${projected.subject.y - scale * 0.34}l${-scale * 0.6} ${scale * 0.48} M${projected.subject.x} ${projected.subject.y - scale * 0.34}l${scale * 0.58} ${scale * 0.42}`}
            stroke="#35434a"
            strokeWidth={scale * 0.13}
            strokeLinecap="round"
          />
          <path
            d={`M${width / 2 - 4} ${height / 2}h8 M${width / 2} ${height / 2 - 4}v8`}
            stroke="#cf6b4b"
            strokeWidth=".7"
            opacity=".8"
          />
          <text x="4" y={height - 4} fontSize="4" fill="#303638">
            {camera.focalLengthMm}mm · {camera.aspectRatio} · {camera.support.toLowerCase()}
          </text>
        </svg>
      </div>
    </figure>
  );
}

export function ShotPlanningSpace({
  initial,
  proposal,
  busy,
  onSave,
  onPromote,
}: {
  initial: ShotPlanningState | null;
  proposal: ShotPlanningState;
  busy: boolean;
  onSave: (state: ShotPlanningState) => Promise<void>;
  onPromote?: (shot: SpatialShotState) => Promise<void>;
}) {
  const [state, setState] = useState<ShotPlanningState>(initial ?? proposal);
  const [savedMessage, setSavedMessage] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const shot = state.activeShot;
  const update = (patch: Partial<SpatialShotState>) =>
    setState((current) => ({
      ...current,
      activeShot: {
        ...current.activeShot,
        ...patch,
        geometryConfidence: "FILMMAKER_CONFIRMED",
      },
    }));
  const updateCamera = (patch: Partial<SpatialShotState["camera"]>) =>
    update({ camera: { ...shot.camera, ...patch } });
  type SpatialMark = "camera" | "target" | "subject" | "subjectEnd" | "movementEnd";
  const moveMark = (kind: SpatialMark, nextX: number, nextZ: number) => {
    const x = clamp(nextX, -5, 5);
    const z = clamp(nextZ, -4, 4);
    setState((current) => {
      const active = current.activeShot;
      if (kind === "subject" || kind === "subjectEnd") {
        const field = kind === "subject" ? "position" : "endPosition";
        return {
          ...current,
          activeShot: {
            ...active,
            geometryConfidence: "FILMMAKER_CONFIRMED",
            subject: {
              ...active.subject,
              [field]: replacePoint(active.subject[field], { x, z }),
            },
          },
        };
      }
      if (kind === "movementEnd")
        return {
          ...current,
          activeShot: {
            ...active,
            geometryConfidence: "FILMMAKER_CONFIRMED",
            movement: {
              ...active.movement,
              end: replacePoint(active.movement.end, { x, z }),
            },
          },
        };
      const field = kind === "camera" ? "position" : "target";
      const nextPosition = replacePoint(active.camera[field], { x, z });
      const movement =
        kind === "camera"
          ? {
              ...active.movement,
              start: nextPosition,
              end: active.movement.kind === "LOCKED" ? nextPosition : active.movement.end,
            }
          : active.movement;
      return {
        ...current,
        activeShot: {
          ...active,
          geometryConfidence: "FILMMAKER_CONFIRMED",
          camera: { ...active.camera, [field]: nextPosition },
          movement,
        },
      };
    });
  };
  const drag = (kind: SpatialMark) => (event: PointerEvent<SVGCircleElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      const screenX = ((clientX - rect.left) / rect.width) * 100;
      const screenY = ((clientY - rect.top) / rect.height) * 100;
      const height =
        kind === "camera" || kind === "movementEnd"
          ? shot.camera.position.y
          : kind === "target"
            ? shot.camera.target.y
            : 0;
      const ground = groundPoint(screenX, screenY, height);
      moveMark(kind, ground.x, ground.z);
    };
    move(event.clientX, event.clientY);
    const onMove = (next: globalThis.PointerEvent) => move(next.clientX, next.clientY);
    const done = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", done);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", done);
  };
  const nudge =
    (kind: SpatialMark, point: SpatialPoint) => (event: KeyboardEvent<SVGCircleElement>) => {
      const step = event.shiftKey ? 0.5 : 0.15;
      const delta =
        event.key === "ArrowLeft"
          ? { x: -step, z: 0 }
          : event.key === "ArrowRight"
            ? { x: step, z: 0 }
            : event.key === "ArrowUp"
              ? { x: 0, z: -step }
              : event.key === "ArrowDown"
                ? { x: 0, z: step }
                : null;
      if (!delta) return;
      event.preventDefault();
      moveMark(kind, point.x + delta.x, point.z + delta.z);
    };
  const save = async () => {
    const version = (state.savedShots.at(-1)?.version ?? 0) + 1;
    const snapshot = { ...shot, version, geometryConfidence: "FILMMAKER_CONFIRMED" as const };
    const next = { ...state, activeShot: snapshot, savedShots: [...state.savedShots, snapshot] };
    setState(next);
    await onSave(next);
    setSavedMessage(`${shot.title} · version ${version} saved`);
  };
  const downloadPlan = () => {
    const text = renderShotPlanText(shot.title, state.savedShots);
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${
      shot.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "shot-plan"
    }.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const distance = Math.hypot(
    shot.camera.target.x - shot.camera.position.x,
    shot.camera.target.y - shot.camera.position.y,
    shot.camera.target.z - shot.camera.position.z,
  );
  const shotSize =
    shot.camera.focalLengthMm >= 50
      ? "medium close-up"
      : shot.camera.focalLengthMm >= 35
        ? "medium-wide"
        : "wide";
  const cameraScreen = isoPoint(shot.camera.position);
  const cameraGround = isoPoint({ ...shot.camera.position, y: 0 });
  const targetScreen = isoPoint(shot.camera.target);
  const targetGround = isoPoint({ ...shot.camera.target, y: 0 });
  const movementStartScreen = isoPoint({ ...shot.movement.start, y: shot.camera.position.y });
  const movementEndScreen = isoPoint({ ...shot.movement.end, y: shot.camera.position.y });
  const subjectScreen = isoPoint({ ...shot.subject.position, y: 0 });
  const subjectEndScreen = isoPoint({ ...shot.subject.endPosition, y: 0 });
  const subjectHead = isoPoint({
    ...shot.subject.position,
    y: shot.subject.pose === "SEATED" ? 1.05 : 1.55,
  });
  const floor = [
    isoPoint({ x: -5, y: 0, z: -4 }),
    isoPoint({ x: 5, y: 0, z: -4 }),
    isoPoint({ x: 5, y: 0, z: 4 }),
    isoPoint({ x: -5, y: 0, z: 4 }),
  ];
  return (
    <section className="space-y-5" aria-label="Interactive 3D filmmaking space">
      <div className="bg-card rounded-lg border p-5">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Starting proposal
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {shot.title}: {shot.camera.focalLengthMm}mm {shot.camera.support.toLowerCase()} setup.
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Adjust the camera, framing, subject, or movement in the room—or focus a mark and use the
          arrow keys. Save the version you want to shoot; every suggestion stays editable.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-lg border bg-[#eef0ec] p-4">
          <div className="mb-2 flex justify-between text-xs font-semibold uppercase">
            <span>Enter the space</span>
            <span className="text-amber-700">
              {shot.geometryConfidence === "FILMMAKER_CONFIRMED"
                ? "Filmmaker-confirmed geometry"
                : shot.geometryConfidence === "OBSERVED"
                  ? "Observed reference"
                  : "Estimated geometry"}
            </span>
          </div>
          <svg
            viewBox="0 0 100 100"
            className="aspect-square w-full touch-none rounded-md bg-[#d9ddd5]"
            role="img"
            aria-label="Three-dimensional room with draggable camera, target, subject, and movement path"
          >
            <polygon
              points={points([
                floor[3]!,
                floor[2]!,
                isoPoint({ x: 5, y: 2.8, z: 4 }),
                isoPoint({ x: -5, y: 2.8, z: 4 }),
              ])}
              fill="#e7e9e3"
              stroke="#7a817d"
              strokeWidth=".7"
            />
            <polygon
              points={points([
                floor[0]!,
                floor[3]!,
                isoPoint({ x: -5, y: 2.8, z: 4 }),
                isoPoint({ x: -5, y: 2.8, z: -4 }),
              ])}
              fill="#dfe3dc"
              stroke="#7a817d"
              strokeWidth=".7"
            />
            <polygon points={points(floor)} fill="#f3f4ef" stroke="#59615c" strokeWidth="1" />
            {[-4, -2, 0, 2, 4].map((x) => {
              const start = isoPoint({ x, y: 0, z: -4 });
              const end = isoPoint({ x, y: 0, z: 4 });
              return (
                <line
                  key={`x-grid-${x}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#c9cec7"
                  strokeWidth=".35"
                />
              );
            })}
            {[-4, -2, 0, 2, 4].map((z) => {
              const start = isoPoint({ x: -5, y: 0, z });
              const end = isoPoint({ x: 5, y: 0, z });
              return (
                <line
                  key={`z-grid-${z}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#c9cec7"
                  strokeWidth=".35"
                />
              );
            })}
            {shot.setPieces.map((setPiece) => (
              <IsoSetPiece key={setPiece.id} setPiece={setPiece} />
            ))}
            <line
              x1={cameraGround.x}
              y1={cameraGround.y}
              x2={cameraScreen.x}
              y2={cameraScreen.y}
              stroke="#315d73"
              strokeDasharray="1.5 1.5"
              strokeWidth=".7"
            />
            <line
              x1={targetGround.x}
              y1={targetGround.y}
              x2={targetScreen.x}
              y2={targetScreen.y}
              stroke="#cf7654"
              strokeDasharray="1.5 1.5"
              strokeWidth=".7"
            />
            <line
              x1={cameraScreen.x}
              y1={cameraScreen.y}
              x2={targetScreen.x}
              y2={targetScreen.y}
              stroke="#315d73"
              strokeWidth="1.3"
            />
            <path
              d={`M${movementStartScreen.x} ${movementStartScreen.y} L${movementEndScreen.x} ${movementEndScreen.y}`}
              stroke="#9b5e35"
              strokeDasharray="3 2"
              strokeWidth="1.2"
            />
            <line
              x1={subjectScreen.x}
              y1={subjectScreen.y}
              x2={subjectEndScreen.x}
              y2={subjectEndScreen.y}
              stroke="#546b56"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <line
              x1={subjectScreen.x}
              y1={subjectScreen.y}
              x2={subjectHead.x}
              y2={subjectHead.y}
              stroke="#35483a"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle
              cx={cameraScreen.x}
              cy={cameraScreen.y}
              r="4.2"
              fill="#315d73"
              role="button"
              tabIndex={0}
              aria-label="Camera position. Use arrow keys to move it across the room."
              onPointerDown={drag("camera")}
              onKeyDown={nudge("camera", shot.camera.position)}
            />
            <text
              x={cameraScreen.x}
              y={cameraScreen.y + 1.2}
              textAnchor="middle"
              fontSize="3"
              fill="white"
              pointerEvents="none"
            >
              CAM
            </text>
            <circle
              cx={targetScreen.x}
              cy={targetScreen.y}
              r="3"
              fill="#cf7654"
              role="button"
              tabIndex={0}
              aria-label="Camera target. Use arrow keys to move the aim point across the room."
              onPointerDown={drag("target")}
              onKeyDown={nudge("target", shot.camera.target)}
            />
            <text
              x={targetScreen.x - 4}
              y={targetScreen.y - 4}
              textAnchor="end"
              fontSize="2.7"
              fill="#26343a"
              pointerEvents="none"
            >
              TARGET
            </text>
            <circle
              cx={subjectScreen.x}
              cy={subjectScreen.y}
              r="3.6"
              fill="#546b56"
              role="button"
              tabIndex={0}
              aria-label={`${shot.subject.label} start position. Use arrow keys to change blocking.`}
              onPointerDown={drag("subject")}
              onKeyDown={nudge("subject", shot.subject.position)}
            />
            <circle cx={subjectHead.x} cy={subjectHead.y} r="2.6" fill="#b98468" stroke="#35483a" />
            <text
              x={subjectHead.x + 4}
              y={subjectHead.y + 5}
              textAnchor="start"
              fontSize="2.7"
              fill="#243328"
              pointerEvents="none"
            >
              {shot.subject.label.slice(0, 10).toUpperCase()}
            </text>
            <circle
              cx={subjectEndScreen.x}
              cy={subjectEndScreen.y}
              r="2.8"
              fill="#829b84"
              stroke="#354838"
              role="button"
              tabIndex={0}
              aria-label={`${shot.subject.label} end position. Use arrow keys to change blocking.`}
              onPointerDown={drag("subjectEnd")}
              onKeyDown={nudge("subjectEnd", shot.subject.endPosition)}
            />
            <text
              x={subjectEndScreen.x - 4}
              y={subjectEndScreen.y + 6}
              textAnchor="end"
              fontSize="2.5"
              fill="#26343a"
              pointerEvents="none"
            >
              SUBJECT END
            </text>
            {shot.movement.kind !== "LOCKED" ? (
              <circle
                cx={movementEndScreen.x}
                cy={movementEndScreen.y}
                r="2.8"
                fill="#d8935f"
                stroke="#704125"
                role="button"
                tabIndex={0}
                aria-label="Camera movement end. Use arrow keys to change the camera path."
                onPointerDown={drag("movementEnd")}
                onKeyDown={nudge("movementEnd", shot.movement.end)}
              />
            ) : null}
          </svg>
          <div className="mt-3 grid gap-1 text-xs text-slate-800 sm:grid-cols-2">
            <span>
              <strong>CAM → TARGET</strong> — camera position and aim
            </span>
            <span>
              <strong>{shot.subject.label}</strong> — start → end blocking
            </span>
            {shot.setPieces.map((setPiece) => (
              <span key={`legend-${setPiece.id}`} className="flex items-center gap-1.5">
                <i
                  className="inline-block size-2.5 rounded-sm border"
                  style={{ backgroundColor: setPiece.color }}
                />
                {setPiece.label}
              </span>
            ))}
          </div>
        </div>
        <CameraFrame shot={shot} label="Look through camera" />
      </div>
      <div className="bg-card grid gap-4 rounded-lg border p-5 md:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium">
          Lens{" "}
          <span className="text-muted-foreground block text-xs">Changes perspective and frame</span>
          <input
            aria-label="Focal length"
            className="mt-2 w-full"
            type="range"
            min="18"
            max="85"
            value={shot.camera.focalLengthMm}
            onChange={(e) => updateCamera({ focalLengthMm: Number(e.target.value) })}
          />
          <span className="mt-1 flex items-center gap-1 text-xs">
            <input
              aria-label="Focal length value"
              className="w-20 rounded border px-2 py-1"
              type="number"
              min="18"
              max="85"
              value={shot.camera.focalLengthMm}
              onChange={(event) =>
                updateCamera({ focalLengthMm: clamp(Number(event.target.value), 18, 85) })
              }
            />
            mm
          </span>
        </label>
        <label className="text-sm font-medium">
          Camera height
          <input
            aria-label="Camera height"
            className="mt-2 w-full"
            type="range"
            min="0.45"
            max="2.2"
            step=".05"
            value={shot.camera.position.y}
            onChange={(e) =>
              updateCamera({
                position: replacePoint(shot.camera.position, { y: Number(e.target.value) }),
              })
            }
          />
          <span className="mt-1 flex items-center gap-1 text-xs">
            <input
              aria-label="Camera height value"
              className="w-20 rounded border px-2 py-1"
              type="number"
              min="0.45"
              max="2.2"
              step=".05"
              value={shot.camera.position.y}
              onChange={(event) =>
                updateCamera({
                  position: replacePoint(shot.camera.position, {
                    y: clamp(Number(event.target.value), 0.45, 2.2),
                  }),
                })
              }
            />
            m
          </span>
        </label>
        <label className="text-sm font-medium">
          Target height
          <span className="text-muted-foreground block text-xs">Tilts the camera up or down</span>
          <input
            aria-label="Target height"
            className="mt-2 w-full"
            type="range"
            min="0.2"
            max="2.4"
            step=".05"
            value={shot.camera.target.y}
            onChange={(e) =>
              updateCamera({
                target: replacePoint(shot.camera.target, { y: Number(e.target.value) }),
              })
            }
          />
          <span className="mt-1 flex items-center gap-1 text-xs">
            <input
              aria-label="Target height value"
              className="w-20 rounded border px-2 py-1"
              type="number"
              min="0.2"
              max="2.4"
              step=".05"
              value={shot.camera.target.y}
              onChange={(event) =>
                updateCamera({
                  target: replacePoint(shot.camera.target, {
                    y: clamp(Number(event.target.value), 0.2, 2.4),
                  }),
                })
              }
            />
            m
          </span>
        </label>
        <label className="text-sm font-medium">
          Composition
          <span className="text-muted-foreground block text-xs">
            Save each ratio as its own setup; no center crop
          </span>
          <select
            aria-label="Aspect ratio"
            className="mt-2 w-full rounded border p-2"
            value={shot.camera.aspectRatio}
            onChange={(e) => updateCamera({ aspectRatio: e.target.value as "16:9" | "9:16" })}
          >
            <option>16:9</option>
            <option>9:16</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Camera movement
          <select
            aria-label="Camera movement"
            className="mt-2 w-full rounded border p-2"
            value={shot.movement.kind}
            onChange={(e) => {
              const kind = e.target.value as SpatialShotState["movement"]["kind"];
              update({
                movement: {
                  ...shot.movement,
                  kind,
                  end:
                    kind === "LOCKED"
                      ? shot.camera.position
                      : replacePoint(shot.camera.position, { z: shot.camera.position.z - 1.2 }),
                },
                camera: {
                  ...shot.camera,
                  support:
                    kind === "LOCKED" ? "LOCKED" : kind === "HANDHELD" ? "HANDHELD" : "DOLLY",
                },
              });
            }}
          >
            <option>LOCKED</option>
            <option>PUSH</option>
            <option>PULL</option>
            <option>TRACK</option>
            <option>ARC</option>
            <option>HANDHELD</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Subject pose
          <select
            aria-label="Subject pose"
            className="mt-2 w-full rounded border p-2"
            value={shot.subject.pose}
            onChange={(e) =>
              update({
                subject: { ...shot.subject, pose: e.target.value as "SEATED" | "STANDING" },
              })
            }
          >
            <option>SEATED</option>
            <option>STANDING</option>
          </select>
        </label>
      </div>
      <article className="bg-card rounded-lg border p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Info
            label="Shoot it"
            value={`${shot.camera.focalLengthMm}mm · ${shotSize} · ${shot.camera.position.y < 1.2 ? "desk height" : "eye level"} · ${shot.camera.support.toLowerCase()} · ${shot.camera.aspectRatio}`}
          />
          <Info label="Action" value={shot.action} />
          <Info label="Blocking" value={shot.blocking} />
          <Info label="Light / color" value={shot.light} />
          <Info label="Look" value={shot.look || "Not yet specified"} />
          <Info label="Sound" value={shot.sound} />
          <Info
            label="Camera → target"
            value={`${distance < 3 ? "Close" : "Across desk"} · ${distance.toFixed(1)}m estimated`}
          />
        </div>
        <details className="mt-4 border-t pt-4">
          <summary className="cursor-pointer text-sm font-semibold">Why this shot</summary>
          <p className="text-muted-foreground mt-2 text-sm">{shot.rationale}</p>
        </details>
        <details className="mt-4 border-t pt-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Refine action, craft, and production notes
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(
              [
                ["Action", "action", shot.action],
                ["Blocking", "blocking", shot.blocking],
                ["Light", "light", shot.light],
                ["Look", "look", shot.look ?? ""],
                ["Sound", "sound", shot.sound],
                ["Production notes", "productionNotes", shot.productionNotes ?? ""],
              ] as const
            ).map(([label, field, value]) => (
              <label key={field} className="text-sm font-medium">
                {label}
                <textarea
                  aria-label={label}
                  className="mt-2 min-h-24 w-full rounded border p-2 font-normal"
                  value={value}
                  onChange={(event) => update({ [field]: event.target.value })}
                />
              </label>
            ))}
          </div>
        </details>
        <div className="mt-5 flex items-center gap-3">
          <Button onClick={() => void save()} disabled={busy}>
            Save this shot
          </Button>
          {savedMessage ? (
            <span role="status" className="text-sm text-emerald-700">
              {savedMessage}
            </span>
          ) : null}
        </div>
      </article>
      {state.savedShots.length ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Saved shot → storyboard</h2>
              <p className="text-muted-foreground text-xs">
                Every saved ratio is its own authored camera setup, never a crop.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={downloadPlan}>
                Download shot plan
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Print shot plan
              </Button>
            </div>
          </div>
          {state.savedShots.map((saved) => (
            <article
              key={`${saved.id}-${saved.version}`}
              className="bg-card grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_.8fr]"
            >
              <CameraFrame shot={saved} label={`${saved.title} · version ${saved.version}`} />
              <div className="space-y-3">
                <Info
                  label="Shoot it"
                  value={`${saved.camera.focalLengthMm}mm · ${saved.camera.aspectRatio} · ${saved.camera.support.toLowerCase()}`}
                />
                <Info label="Action" value={saved.action} />
                <Info label="Blocking" value={saved.blocking} />
                <Info label="Light" value={saved.light} />
                <Info label="Look" value={saved.look || "Not yet specified"} />
                <Info label="Sound" value={saved.sound} />
                <Info label="Production notes" value={saved.productionNotes || "None recorded"} />
                <Info label="Why" value={saved.rationale} />
                {saved.directionTitle ? (
                  <Info
                    label="Creative direction"
                    value={`${saved.directionTitle} — ${saved.directionRationale ?? saved.rationale}`}
                  />
                ) : null}
                {onPromote ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={promoting === saved.id}
                    onClick={async () => {
                      setPromoting(saved.id);
                      try {
                        await onPromote(saved);
                      } finally {
                        setPromoting(null);
                      }
                    }}
                  >
                    {promoting === saved.id ? "Creating decision…" : "Make shot a decision"}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{value}</p>
    </div>
  );
}
