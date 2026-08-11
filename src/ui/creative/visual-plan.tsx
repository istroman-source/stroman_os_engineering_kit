"use client";

import { type FormEvent, useMemo, useState } from "react";
import type {
  BlockingPlan,
  CoveragePriority,
  LightingPlan,
  LookPlan,
  PrevisComposition,
  PrevisFigure,
  PrevisSetPiece,
  ProductionReality,
  ScoutPhotoRef,
  SpatialClaim,
  VisualPlan,
} from "@/domain/creative";
import { Button } from "@/ui/primitives/button";

type BlueprintPanel = "STORYBOARD" | "BLOCKING" | "LIGHTING" | "LOOK" | "SOUND" | "COVERAGE";

const panelLabels: ReadonlyArray<readonly [BlueprintPanel, string]> = [
  ["STORYBOARD", "Storyboard"],
  ["BLOCKING", "Blocking"],
  ["LIGHTING", "Lighting"],
  ["LOOK", "Look"],
  ["SOUND", "Sound"],
  ["COVERAGE", "Coverage"],
];

interface FrameScale {
  readonly width: number;
  readonly height: number;
  readonly unit: number;
}

const frameX = (value: number, frame: FrameScale) => (value / 100) * frame.width;
const frameY = (value: number, frame: FrameScale) => (value / 100) * frame.height;

function SetPiece({ piece, frame }: { piece: PrevisSetPiece; frame: FrameScale }) {
  const story = piece.emphasis === "STORY";
  const x = frameX(piece.x, frame);
  const y = frameY(piece.y, frame);
  const width = frameX(piece.width, frame);
  const height = frameY(piece.height, frame);
  const fill =
    piece.kind === "WINDOW"
      ? "#ccdde4"
      : piece.kind === "PRACTICAL"
        ? "#ead39b"
        : piece.kind === "MEAL"
          ? "#a94a3d"
          : piece.plane === "FOREGROUND"
            ? "#d4cec0"
            : "#e9e4d8";
  if (piece.kind === "DOOR") {
    return (
      <g>
        <path
          d={`M${x} ${y + height} V${y} H${x + width} V${y + height}`}
          fill="none"
          stroke={story ? "#8e3c32" : "#67635b"}
          strokeWidth={(story ? 1.2 : 0.7) * frame.unit}
        />
        <text x={x + frame.unit} y={y + 5 * frame.unit} fontSize={2.8 * frame.unit} fill="#4d4a44">
          {piece.label}
        </text>
      </g>
    );
  }
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={frame.unit}
        fill={fill}
        fillOpacity={piece.plane === "BACKGROUND" ? 0.58 : 0.88}
        stroke={story ? "#8e3c32" : "#67635b"}
        strokeWidth={(story ? 1.2 : 0.6) * frame.unit}
      />
      {piece.kind === "WINDOW" ? (
        <path
          d={`M${x + width / 2} ${y} V${y + height} M${x} ${y + height / 2} H${x + width}`}
          stroke="#6e8792"
          strokeWidth={0.45 * frame.unit}
        />
      ) : null}
      {piece.kind === "FRIDGE" ? (
        <path
          d={`M${x} ${y + height * 0.42} H${x + width}`}
          stroke="#67635b"
          strokeWidth={0.45 * frame.unit}
        />
      ) : null}
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(3.1, Math.max(2.1, piece.width / 7)) * frame.unit}
        fill={piece.kind === "MEAL" ? "#fffaf0" : "#4d4a44"}
        fontWeight={story ? 650 : 500}
      >
        {piece.label}
      </text>
    </g>
  );
}

function Figure({ figure, frame }: { figure: PrevisFigure; frame: FrameScale }) {
  const x = frameX(figure.x, frame);
  const y = frameY(figure.y, frame);
  const width = frameX(figure.width, frame);
  const height = frameY(figure.height, frame);
  const centerX = x + width / 2;
  const headY = y + height * 0.16;
  if (figure.kind === "BABY_HANDS" || figure.kind === "BABY_FEET") {
    return (
      <g>
        <ellipse
          cx={centerX}
          cy={y + height / 2}
          rx={width / 2}
          ry={height / 2}
          fill="#d9aa8c"
          stroke="#563f35"
          strokeWidth={0.7 * frame.unit}
        />
        <text
          x={centerX}
          y={y + height + 3.2 * frame.unit}
          textAnchor="middle"
          fontSize={2.6 * frame.unit}
          fill="#4d4a44"
          fontWeight="650"
        >
          {figure.label}
        </text>
      </g>
    );
  }
  return (
    <g>
      <ellipse
        cx={centerX}
        cy={headY}
        rx={width * 0.19}
        ry={height * 0.1}
        fill="#c99778"
        stroke="#403d38"
        strokeWidth={0.7 * frame.unit}
      />
      <path
        d={`M${centerX} ${headY + height * 0.11} L${centerX} ${y + height * 0.62} M${centerX} ${y + height * 0.3} L${x + width * 0.15} ${y + height * 0.48} M${centerX} ${y + height * 0.3} L${x + width * 0.88} ${y + height * 0.46} M${centerX} ${y + height * 0.62} L${x + width * 0.25} ${y + height} M${centerX} ${y + height * 0.62} L${x + width * 0.78} ${y + height}`}
        fill="none"
        stroke="#403d38"
        strokeWidth={1.3 * frame.unit}
        strokeLinecap="round"
      />
      <text
        x={centerX}
        y={Math.min(frame.height - 2 * frame.unit, y + height + 3.2 * frame.unit)}
        textAnchor="middle"
        fontSize={2.8 * frame.unit}
        fill="#403d38"
        fontWeight="700"
      >
        {figure.label}
      </text>
    </g>
  );
}

function PrevisFrame({ composition }: { composition: PrevisComposition }) {
  const marker = `previs-arrow-${composition.id}`;
  const isVertical = composition.aspectRatio === "9:16";
  const frame: FrameScale = isVertical
    ? { width: 90, height: 160, unit: 0.9 }
    : { width: 160, height: 90, unit: 0.9 };
  const x = (value: number) => frameX(value, frame);
  const y = (value: number) => frameY(value, frame);
  return (
    <figure className="min-w-0">
      <div
        className={`relative mx-auto overflow-hidden rounded-md border-2 border-[#34312c] bg-[#f4efe3] shadow-sm ${
          isVertical ? "aspect-[9/16] max-h-[31rem] w-auto max-w-full" : "aspect-video w-full"
        }`}
      >
        <svg
          viewBox={`0 0 ${frame.width} ${frame.height}`}
          className="h-full w-full"
          role="img"
          aria-label={`${composition.aspectRatio} ${composition.shotScale} composition`}
        >
          <defs>
            <pattern
              id={`paper-${composition.id}`}
              width="6.3"
              height="6.3"
              patternUnits="userSpaceOnUse"
            >
              <path d="M6.3 0H0V6.3" fill="none" stroke="#d9d2c4" strokeWidth="0.16" />
            </pattern>
            <marker
              id={marker}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10Z" fill="currentColor" />
            </marker>
          </defs>
          <rect width={frame.width} height={frame.height} fill={`url(#paper-${composition.id})`} />
          {composition.negativeSpace ? (
            <g>
              <rect
                x={x(composition.negativeSpace.x)}
                y={y(composition.negativeSpace.y)}
                width={x(composition.negativeSpace.width)}
                height={y(composition.negativeSpace.height)}
                fill="#dfe7e7"
                fillOpacity="0.35"
                stroke="#7f8c8e"
                strokeWidth={0.5 * frame.unit}
                strokeDasharray={`${2 * frame.unit} ${frame.unit}`}
              />
              <text
                x={x(composition.negativeSpace.x + composition.negativeSpace.width / 2)}
                y={y(composition.negativeSpace.y) + 4 * frame.unit}
                textAnchor="middle"
                fontSize={2.5 * frame.unit}
                fill="#5f6d70"
              >
                NEGATIVE SPACE
              </text>
            </g>
          ) : null}
          {["BACKGROUND", "MIDGROUND", "FOREGROUND"].flatMap((plane) =>
            composition.setPieces
              .filter((piece) => piece.plane === plane)
              .map((piece) => (
                <SetPiece key={`${piece.kind}-${piece.label}`} piece={piece} frame={frame} />
              )),
          )}
          {["BACKGROUND", "MIDGROUND", "FOREGROUND"].flatMap((plane) =>
            composition.figures
              .filter((item) => item.plane === plane)
              .map((item) => (
                <Figure key={`${item.kind}-${item.label}`} figure={item} frame={frame} />
              )),
          )}
          {composition.motion.map((motion) => (
            <g key={motion.label} className="text-[#963f34]">
              <path
                d={`M${x(motion.fromX)} ${y(motion.fromY)} Q${x((motion.fromX + motion.toX) / 2)} ${y(Math.min(motion.fromY, motion.toY)) - 6 * frame.unit} ${x(motion.toX)} ${y(motion.toY)}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={frame.unit}
                strokeDasharray={`${3 * frame.unit} ${frame.unit}`}
                markerEnd={`url(#${marker})`}
              />
              <text
                x={x((motion.fromX + motion.toX) / 2)}
                y={y(Math.min(motion.fromY, motion.toY)) - 7 * frame.unit}
                textAnchor="middle"
                fontSize={2.7 * frame.unit}
                fill="currentColor"
              >
                {motion.label}
              </text>
            </g>
          ))}
          {composition.light.map((light) => (
            <g key={light.label}>
              <path
                d={`M${x(light.fromX)} ${y(light.fromY)} L${x(light.toX)} ${y(light.toY)}`}
                stroke={
                  light.tone === "COOL" ? "#6f91a0" : light.tone === "WARM" ? "#c58d35" : "#77736a"
                }
                strokeWidth={1.5 * frame.unit}
                strokeOpacity="0.8"
                markerEnd={`url(#${marker})`}
              />
            </g>
          ))}
          {composition.eyelineY !== null ? (
            <path
              d={`M0 ${y(composition.eyelineY)} H${frame.width}`}
              stroke="#596b70"
              strokeWidth={0.35 * frame.unit}
              strokeDasharray={`${frame.unit} ${2 * frame.unit}`}
              opacity="0.7"
            />
          ) : null}
          <path
            d={`M0 0H${frame.width}V${frame.height}H0Z`}
            fill="none"
            stroke="#2f2c28"
            strokeWidth={1.6 * frame.unit}
          />
        </svg>
        <span className="absolute top-2 left-2 rounded-sm bg-[#2f2c28] px-1.5 py-0.5 font-mono text-[0.62rem] font-semibold text-[#f8f3e8]">
          {composition.aspectRatio}
        </span>
      </div>
      <figcaption className="mx-auto mt-2 max-w-xl rounded-md border border-[#d1cabd] bg-[#f8f4ea] px-3 py-2 text-[#34312c]">
        <p className="font-mono text-[0.68rem] font-semibold tracking-wide uppercase">
          {composition.executionStrip[0]}
        </p>
        <p className="mt-1 text-xs text-[#625d55]">{composition.executionStrip[1]}</p>
      </figcaption>
    </figure>
  );
}

function Storyboard({ plan }: { plan: VisualPlan }) {
  return (
    <div className="space-y-7">
      <p className="text-muted-foreground text-sm">
        Horizontal and vertical are separate setups. Compare the frame first; execution notes stay
        short.
      </p>
      {plan.shots.map((shot, index) => (
        <article key={shot.id} className="border-border rounded-lg border bg-white/40 p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-muted-foreground font-mono text-xs">
                SHOT {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-lg font-semibold">{shot.title}</h3>
            </div>
            <CoverageBadge value={shot.priority} />
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.72fr)]">
            <PrevisFrame composition={shot.horizontal} />
            <PrevisFrame composition={shot.vertical} />
          </div>
        </article>
      ))}
    </div>
  );
}

function PersonMarker({
  x,
  y,
  label,
  note,
  baby,
}: {
  x: number;
  y: number;
  label: string;
  note: string;
  baby: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cy="-3" r="3" fill="#b37d60" stroke="#3d3933" strokeWidth="0.6" />
      <path
        d="M0 0V8 M-4 4H4 M0 8L-4 13 M0 8L4 13"
        stroke="#3d3933"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {baby ? (
        <circle cx="4" cy="1" r="2.2" fill="#dfb99f" stroke="#3d3933" strokeWidth="0.5" />
      ) : null}
      <text x="0" y="18" textAnchor="middle" fontSize="2.3" fill="#3d3933" fontWeight="700">
        {label}
      </text>
      <text x="0" y="21" textAnchor="middle" fontSize="1.6" fill="#686158">
        {note}
      </text>
    </g>
  );
}

function CameraMarker({
  x,
  y,
  label,
  aimX,
  aimY,
}: {
  x: number;
  y: number;
  label: string;
  aimX: number;
  aimY: number;
}) {
  return (
    <g>
      <path
        d={`M${x} ${y} L${aimX} ${aimY}`}
        stroke="#3e4e53"
        strokeWidth="0.8"
        strokeDasharray="2 1"
      />
      <g transform={`translate(${x} ${y})`}>
        <rect x="-4" y="-3" width="7" height="6" rx="1" fill="#34464c" />
        <path d="M3-2L8-5V5L3 2Z" fill="#34464c" />
        <text x="0" y="-6" textAnchor="middle" fontSize="2.8" fill="#27383d" fontWeight="800">
          {label}
        </text>
      </g>
    </g>
  );
}

function BlockingDiagram({ plan }: { plan: BlockingPlan }) {
  const marker = "blocking-direction";
  return (
    <figure className="rounded-lg border border-[#c9c1b4] bg-[#f4efe3] p-4 text-[#34312c]">
      <figcaption>
        <p className="font-semibold">{plan.title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{plan.question}</p>
      </figcaption>
      <svg
        viewBox="0 0 100 100"
        className="mx-auto mt-4 w-full max-w-4xl"
        role="img"
        aria-label={`${plan.title}. ${plan.question}`}
      >
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M0 0L10 5L0 10Z" fill="#99463b" />
          </marker>
        </defs>
        <rect width="100" height="100" fill="#f4efe3" />
        {plan.zones.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              rx="1"
              fill="#e1dbcf"
              stroke="#6c665d"
              strokeWidth="0.7"
            />
            <text
              x={zone.x + 1.5}
              y={zone.y + 3.5}
              textAnchor="start"
              fontSize="2.2"
              fill="#4d4942"
              fontWeight="650"
            >
              {zone.label}
            </text>
          </g>
        ))}
        {plan.subjects.map((subject) => (
          <g key={subject.id}>
            {subject.states.slice(0, -1).map((state, index) => {
              const next = subject.states[index + 1]!;
              return (
                <path
                  key={state.label}
                  d={`M${state.x} ${state.y} L${next.x} ${next.y}`}
                  stroke="#99463b"
                  strokeWidth="1.5"
                  markerEnd={`url(#${marker})`}
                />
              );
            })}
            {subject.states.map((state) => (
              <PersonMarker
                key={state.label}
                x={state.x}
                y={state.y}
                label={`${subject.label} — ${state.label}`}
                note={state.note}
                baby={Boolean(subject.carries)}
              />
            ))}
          </g>
        ))}
        {plan.cameras.map((camera) => (
          <CameraMarker key={camera.id} {...camera} />
        ))}
      </svg>
      {plan.restrictions.length ? (
        <p className="mt-3 rounded-md bg-white/55 px-3 py-2 text-xs text-[#5d574f]">
          <span className="font-semibold text-[#312e2a]">Do not assume:</span>{" "}
          {plan.restrictions.join(" ")}
        </p>
      ) : null}
    </figure>
  );
}

function LightingDiagram({ plan }: { plan: LightingPlan }) {
  return (
    <figure className="rounded-lg border border-[#c9c1b4] bg-[#f4efe3] p-4 text-[#34312c]">
      <figcaption>
        <p className="font-semibold">{plan.title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{plan.question}</p>
      </figcaption>
      <svg
        viewBox="0 0 100 100"
        className="mx-auto mt-4 w-full max-w-4xl"
        role="img"
        aria-label={`${plan.title}. ${plan.question}`}
      >
        <rect width="100" height="100" fill="#f4efe3" />
        {plan.zones.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              rx="1"
              fill="#e3ddd1"
              stroke="#6c665d"
              strokeWidth="0.7"
            />
            <text
              x={zone.x + 1.5}
              y={zone.y + zone.height - 2}
              textAnchor="start"
              fontSize="2.2"
              fill="#4d4942"
            >
              {zone.label}
            </text>
          </g>
        ))}
        {plan.sources.map((source) => {
          const color =
            source.tone === "COOL" ? "#668998" : source.tone === "WARM" ? "#c28b32" : "#6d6b66";
          return (
            <g key={source.id}>
              <path
                d={`M${source.x} ${source.y} L${source.toX} ${source.toY}`}
                stroke={color}
                strokeWidth="2.2"
                strokeOpacity="0.76"
              />
              <circle cx={source.x} cy={source.y} r="3.2" fill={color} />
              <text
                x={source.x}
                y={source.y - 5}
                textAnchor="middle"
                fontSize="1.8"
                fill="#3e3932"
                fontWeight="700"
              >
                {source.label.split(" — ")[0]}
              </text>
              <text x={source.x} y={source.y + 6} textAnchor="middle" fontSize="1.4" fill="#625d55">
                {source.control}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mx-auto mt-3 grid max-w-4xl gap-2 sm:grid-cols-2">
        {plan.sources.map((source) => (
          <div key={source.id} className="rounded-md border border-[#c9c1b4] bg-white/45 px-3 py-2">
            <p className="text-xs font-semibold">
              {source.label} · {source.control.toLowerCase()}
            </p>
            <p className="mt-1 text-xs text-[#625d55]">{source.use}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-md bg-white/55 px-3 py-2 text-xs text-[#5d574f]">
        {plan.instruction}
      </p>
    </figure>
  );
}

function LookView({ look }: { look: LookPlan }) {
  return (
    <section className="rounded-lg border border-[#c9c1b4] bg-[#f4efe3] p-4 text-[#34312c]">
      <h3 className="font-semibold">{look.title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{look.question}</p>
      <div
        className="mt-5 flex overflow-hidden rounded-lg border border-black/10"
        aria-label="Sequence palette"
      >
        {look.swatches.map((swatch) => (
          <span
            key={swatch.name}
            className="h-24 flex-1"
            style={{ backgroundColor: swatch.color }}
            title={`${swatch.name}: ${swatch.use}`}
          />
        ))}
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <PlanNote label="Contrast" value={look.contrast} />
        <PlanNote label="Texture" value={look.texture} />
        <PlanNote label="Restraint" value={look.restraint} />
      </div>
    </section>
  );
}

function PlanNote({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-[0.68rem] tracking-wide uppercase">{label}</p>
      <p className="mt-1 leading-relaxed">{value}</p>
    </div>
  );
}

function CoverageBadge({ value }: { value: CoveragePriority }) {
  const label =
    value === "OPTIONAL_EXPLORATION"
      ? "Optional exploration"
      : value === "MUST_GET"
        ? "Must get"
        : "Safety";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[0.66rem] font-semibold tracking-wide uppercase ${value === "MUST_GET" ? "bg-[#2f433c] text-white" : value === "SAFETY" ? "bg-[#ddd5c5] text-[#3e3932]" : "border border-[#b9b0a2] text-[#5c554b]"}`}
    >
      {label}
    </span>
  );
}

function ScoutPhoto({ photo, projectId }: { photo: ScoutPhotoRef; projectId: string }) {
  const src = photo.fileName.startsWith("/")
    ? photo.fileName
    : `/api/v1/projects/${projectId}/scout-photos/${photo.mediaAssetId}`;
  return (
    <figure className="overflow-hidden rounded-md border border-[#c9c1b4] bg-[#f4efe3] text-[#34312c]">
      {/* eslint-disable-next-line @next/next/no-img-element -- authenticated project-scoped source */}
      <img
        src={src}
        alt={`${photo.angleLabel}: ${photo.fileName}`}
        className="aspect-[4/3] w-full object-cover"
      />
      <figcaption className="px-2.5 py-2 text-xs">
        <span className="font-semibold">{photo.angleLabel}</span>
        <span className="text-muted-foreground ml-2">{photo.fileName.split("/").pop()}</span>
      </figcaption>
    </figure>
  );
}

function Claim({ claim }: { claim: SpatialClaim }) {
  const label =
    claim.state === "VISIBLE_FACT"
      ? "Visible"
      : claim.state === "INFERRED_GEOMETRY"
        ? "Inferred"
        : "Confirmed";
  return (
    <li className="grid gap-1 border-t py-2 first:border-t-0 sm:grid-cols-[5rem_1fr]">
      <span className="text-muted-foreground font-mono text-[0.65rem] uppercase">{label}</span>
      <span className="text-sm">
        <strong>{claim.label}.</strong> {claim.detail}
      </span>
    </li>
  );
}

function ScoutPanel({
  plan,
  projectId,
  busy,
  onUpload,
  onCorrection,
}: {
  plan: VisualPlan;
  projectId: string;
  busy: boolean;
  onUpload: (files: readonly File[]) => Promise<void>;
  onCorrection: (statement: string) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [correction, setCorrection] = useState("");
  async function submitPhotos(event: FormEvent) {
    event.preventDefault();
    if (!files.length) return;
    await onUpload(files);
    setFiles([]);
  }
  async function submitCorrection(event: FormEvent) {
    event.preventDefault();
    if (!correction.trim()) return;
    await onCorrection(correction.trim());
    setCorrection("");
  }
  return (
    <section className="border-border rounded-lg border p-4" aria-labelledby="scout-photos">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Optional location-aware mode
          </p>
          <h3 id="scout-photos" className="mt-1 font-semibold">
            Scout photos / location photos
          </h3>
        </div>
        <span className="rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase">
          {plan.location.mode === "PHOTO_ANCHORED"
            ? "Photo anchored"
            : plan.location.mode === "PHOTO_INPUT_PENDING"
              ? "Photos added · geometry pending"
              : "Intent only"}
        </span>
      </div>
      {plan.location.photos.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {plan.location.photos.map((photo) => (
            <ScoutPhoto key={photo.id} photo={photo} projectId={projectId} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          The plan works without photos. Add a wide and reverse angle when physical space becomes
          the next decision.
        </p>
      )}
      <form onSubmit={submitPhotos} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm">
          <span className="font-medium">Add up to six angles</span>
          <input
            className="mt-1 block w-full text-sm"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>
        <Button type="submit" size="sm" disabled={busy || files.length === 0}>
          {busy ? "Grounding…" : "Add scout photos"}
        </Button>
      </form>
      {plan.location.claims.length ? (
        <ul className="bg-muted/35 mt-4 rounded-md px-3">
          {plan.location.claims.map((claim) => (
            <Claim key={claim.id} claim={claim} />
          ))}
        </ul>
      ) : null}
      {plan.location.confirmationQuestion ? (
        <form
          onSubmit={submitCorrection}
          className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/5 p-3"
        >
          <p className="text-sm font-medium">{plan.location.confirmationQuestion}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={correction}
              onChange={(event) => setCorrection(event.target.value)}
              className="border-border bg-background min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="Quick correction — e.g. camera cannot go behind the island"
              maxLength={1000}
            />
            <Button type="submit" size="sm" variant="outline" disabled={busy || !correction.trim()}>
              Apply correction
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function SoundView({ plan }: { plan: VisualPlan }) {
  return (
    <div className="space-y-3">
      {plan.sound.map((beat) => (
        <article key={beat.sceneId} className="border-border rounded-lg border p-4">
          <h3 className="font-semibold">{beat.label}</h3>
          <p className="mt-2 text-sm">
            <span className="font-medium">Record:</span> {beat.mustRecord.join(" · ")}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">{beat.perspective}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            <span className="text-foreground font-medium">Restraint:</span> {beat.restraint}
          </p>
        </article>
      ))}
    </div>
  );
}

function CoverageView({ plan }: { plan: VisualPlan }) {
  const grouped = useMemo(
    () =>
      (["MUST_GET", "SAFETY", "OPTIONAL_EXPLORATION"] as const).map(
        (priority) =>
          [priority, plan.coverage.filter((item) => item.priority === priority)] as const,
      ),
    [plan.coverage],
  );
  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-[#2f433c] px-4 py-3 text-sm text-white">
        <strong>If you only get four setups:</strong> protect every Must get before adding safety or
        exploration.
      </p>
      {grouped.map(([priority, items]) =>
        items.length ? (
          <section key={priority}>
            <div className="mb-2">
              <CoverageBadge value={priority} />
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <article key={item.id} className="border-border rounded-md border p-3">
                  <h3 className="text-sm font-semibold">{item.label}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Serves: {item.serves.join(" · ")}
                  </p>
                  <p className="mt-2 text-sm">{item.why}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}

export function VisualPlanView({
  plan,
  projectId,
  busy,
  onUpload,
  onCorrection,
}: {
  plan: VisualPlan;
  projectId: string;
  busy: boolean;
  onUpload: (files: readonly File[]) => Promise<void>;
  onCorrection: (statement: string) => Promise<void>;
}) {
  const stagePanel: BlueprintPanel =
    plan.stage === "SCOUTING"
      ? "BLOCKING"
      : plan.stage === "SHOOTING" || plan.stage === "POST"
        ? "COVERAGE"
        : "STORYBOARD";
  const [panelChoice, setPanelChoice] = useState<{
    readonly stage: VisualPlan["stage"];
    readonly value: BlueprintPanel;
  }>({ stage: plan.stage, value: stagePanel });
  const panel = panelChoice.stage === plan.stage ? panelChoice.value : stagePanel;
  return (
    <div className="space-y-5">
      <ScoutPanel
        plan={plan}
        projectId={projectId}
        busy={busy}
        onUpload={onUpload}
        onCorrection={onCorrection}
      />
      {plan.delta.changed.length ? (
        <section className="rounded-lg border border-[#87a29a] bg-[#eef4f1] p-4 text-[#243b33]">
          <p className="text-xs font-semibold tracking-wide text-[#345448] uppercase">
            What changed · {plan.delta.trigger}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {plan.delta.changed.map((item) => (
              <li key={item}>→ {item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <nav
        className="flex gap-1 overflow-x-auto rounded-lg border p-1"
        aria-label="Blueprint views"
      >
        {panelLabels.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPanelChoice({ stage: plan.stage, value })}
            aria-current={panel === value ? "page" : undefined}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium ${panel === value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {panel === "STORYBOARD" ? <Storyboard plan={plan} /> : null}
      {panel === "BLOCKING" ? <BlockingDiagram plan={plan.blocking} /> : null}
      {panel === "LIGHTING" ? <LightingDiagram plan={plan.lighting} /> : null}
      {panel === "LOOK" ? <LookView look={plan.look} /> : null}
      {panel === "SOUND" ? <SoundView plan={plan} /> : null}
      {panel === "COVERAGE" ? <CoverageView plan={plan} /> : null}
    </div>
  );
}

export function ProductionRealityForm({
  initial,
  busy,
  onSave,
}: {
  initial: ProductionReality;
  busy: boolean;
  onSave: (value: Partial<ProductionReality>) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const fields: ReadonlyArray<readonly [keyof ProductionReality, string, string]> = [
    ["crew", "Crew", "solo operator or crew"],
    ["cameraBody", "Camera", "body / sensor"],
    ["lenses", "Lenses", "available focal lengths"],
    ["support", "Support", "tripod, handheld, gimbal, dolly"],
    ["lighting", "Lighting", "available fixtures / modifiers"],
    ["sound", "Sound", "recorders / microphones"],
    ["shootTime", "Shoot time", "available hours / setups"],
    ["access", "Location access", "limits / off-limits areas"],
    ["talent", "Talent", "availability / child or animal restrictions"],
    ["budget", "Budget", "constraint level"],
    ["timeOfDay", "Time of day", "fixed or flexible"],
  ];
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(value);
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {fields.map(([key, label, placeholder]) => (
        <label key={key} className="text-sm">
          <span className="font-medium">{label}</span>
          <input
            className="border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={value[key]}
            onChange={(event) => setValue((current) => ({ ...current, [key]: event.target.value }))}
            placeholder={placeholder}
            maxLength={500}
          />
        </label>
      ))}
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Use these constraints"}
        </Button>
      </div>
    </form>
  );
}
