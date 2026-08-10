"use client";

import type { BlockingPosition, StoryboardArtifact, StoryboardGlyph } from "@/domain/creative";

function Glyph({ glyph }: { glyph: StoryboardGlyph }) {
  const transform = `translate(${glyph.x} ${glyph.y}) scale(${glyph.scale})`;
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as const;
  let drawing: React.ReactNode;
  switch (glyph.kind) {
    case "ADULT":
      drawing = (
        <>
          <circle cx="0" cy="-12" r="5" {...common} />
          <path d="M0-7 L0 7 M-9-1 L0-5 L10 1 M0 7 L-7 18 M0 7 L8 18" {...common} />
        </>
      );
      break;
    case "BABY_HANDS":
      drawing = (
        <>
          <path
            d="M-9 4 Q-7-5-3 2 Q-2-8 1 1 Q3-7 5 2 Q8-3 9 4 Q7 11 0 12 Q-7 11-9 4Z"
            {...common}
          />
          <path d="M0 12 L0 18" {...common} />
        </>
      );
      break;
    case "BABY_FEET":
      drawing = (
        <>
          <ellipse cx="-5" cy="2" rx="4" ry="9" {...common} />
          <ellipse cx="6" cy="0" rx="4" ry="9" {...common} />
          <circle cx="-6" cy="-8" r="1" fill="currentColor" />
          <circle cx="5" cy="-10" r="1" fill="currentColor" />
        </>
      );
      break;
    case "FRIDGE":
      drawing = (
        <>
          <rect x="-9" y="-17" width="18" height="34" rx="1" {...common} />
          <path d="M-9-4 H9 M5-12 V-7 M5 1 V8" {...common} />
        </>
      );
      break;
    case "MEAL":
      drawing = (
        <>
          <path d="M-11-4 Q0-9 11-4 L9 9 H-9Z" {...common} />
          <path d="M-8-2 Q0 2 8-2" {...common} />
        </>
      );
      break;
    case "MONITOR":
    case "PHONE":
      drawing = (
        <>
          <rect x="-6" y="-11" width="12" height="22" rx="2" {...common} />
          <path d="M-3 6 H3" {...common} />
          {glyph.kind === "MONITOR" ? <path d="M-3-2 Q0-6 3-2 M-2 1 Q0-2 2 1" {...common} /> : null}
        </>
      );
      break;
    case "COUNTER":
    case "TABLE":
      drawing = (
        <>
          <path d="M-15 0 H15 M-12 0 V14 M12 0 V14" {...common} />
          {glyph.kind === "COUNTER" ? <path d="M-15-5 H15 V0 H-15Z" {...common} /> : null}
        </>
      );
      break;
    case "WINDOW":
      drawing = (
        <>
          <rect x="-11" y="-13" width="22" height="26" {...common} />
          <path d="M0-13 V13 M-11 0 H11" {...common} />
        </>
      );
      break;
    case "DOOR":
      drawing = (
        <>
          <path d="M-9 17 V-17 H9 V17" {...common} />
          <circle cx="5" cy="1" r="1" fill="currentColor" />
        </>
      );
      break;
    default:
      drawing = (
        <>
          <path d="M-10 8 L-7-8 L8-10 L11 7Z" {...common} />
          <path d="M-6 2 Q0-4 7 1" {...common} />
        </>
      );
  }
  return (
    <g transform={transform} className="text-[#31302c]">
      {drawing}
    </g>
  );
}

function Frame({ frame, index }: { frame: StoryboardArtifact["frames"][number]; index: number }) {
  const markerId = `pencil-arrow-${index}`;
  return (
    <figure className="overflow-hidden rounded-md border border-[#bcb7aa] bg-[#f5f0e5] shadow-sm">
      <svg
        viewBox="0 0 100 72"
        className="aspect-[4/3] w-full text-[#31302c]"
        role="img"
        aria-label={`${frame.title}: ${frame.annotation}`}
      >
        <defs>
          <filter id={`pencil-${index}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="2"
              seed={index + 2}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.35" />
          </filter>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10Z" fill="currentColor" />
          </marker>
          <pattern id={`grid-${index}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M8 0H0V8" fill="none" stroke="#ded8ca" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100" height="72" fill={`url(#grid-${index})`} />
        <g filter={`url(#pencil-${index})`}>
          {frame.glyphs.map((glyph, glyphIndex) => (
            <Glyph key={`${glyph.kind}-${glyphIndex}-${glyph.label}`} glyph={glyph} />
          ))}
          {frame.arrows.map((arrow) => (
            <g key={`${arrow.fromX}-${arrow.toX}-${arrow.label}`}>
              <path
                d={`M${arrow.fromX} ${arrow.fromY} Q${(arrow.fromX + arrow.toX) / 2} ${Math.min(arrow.fromY, arrow.toY) - 7} ${arrow.toX} ${arrow.toY}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 1"
                markerEnd={`url(#${markerId})`}
              />
            </g>
          ))}
        </g>
        <path
          d="M2 3 Q45 1 98 3 M2 69 Q49 71 98 69"
          fill="none"
          stroke="#8f8b82"
          strokeWidth="0.35"
        />
      </svg>
      <figcaption className="border-t border-[#c9c3b5] px-3 py-2 text-[#31302c]">
        <p className="font-mono text-[0.65rem] tracking-[0.12em] uppercase">{frame.cameraLabel}</p>
        <p className="mt-1 text-sm font-semibold">{frame.title}</p>
        <p className="mt-1 text-xs text-[#625f57]">{frame.annotation}</p>
        <p className="mt-2 border-t border-[#d7d1c4] pt-2 font-mono text-[0.62rem] leading-relaxed text-[#625f57] uppercase">
          {frame.glyphs.map((glyph) => glyph.label).join(" · ")}
          {frame.arrows.length > 0
            ? ` / motion: ${frame.arrows.map((arrow) => arrow.label).join(" · ")}`
            : ""}
        </p>
      </figcaption>
    </figure>
  );
}

function PositionMark({ position }: { position: BlockingPosition }) {
  const style =
    position.kind === "CAMERA"
      ? "fill-[#31302c]"
      : position.kind === "LIGHT"
        ? "fill-[#d4a62a]"
        : "fill-[#9f3f35]";
  return (
    <g transform={`translate(${position.x} ${position.y})`}>
      {position.kind === "CAMERA" ? (
        <path d="M-4-3 H3 V3 H-4Z M3-2 L7-5 V5 L3 2Z" className={style} />
      ) : position.kind === "LIGHT" ? (
        <path d="M0-6 L2-2 L6 0 L2 2 L0 6 L-2 2 L-6 0 L-2-2Z" className={style} />
      ) : (
        <circle r="4" className={style} />
      )}
    </g>
  );
}

export function StoryboardArtifactView({ artifact }: { artifact: StoryboardArtifact }) {
  return (
    <section
      aria-labelledby="visual-blueprint"
      className="border-border bg-card rounded-lg border p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
            Drawn visual blueprint
          </p>
          <h2 id="visual-blueprint" className="mt-1 text-lg font-semibold">
            {artifact.title}
          </h2>
        </div>
        <span className="rounded-full border border-[#bcb7aa] bg-[#f5f0e5] px-2.5 py-1 font-mono text-[0.65rem] tracking-wide text-[#31302c] uppercase">
          storyboard · blocking · look
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {artifact.frames.map((frame, index) => (
          <Frame key={frame.id} frame={frame} index={index} />
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <figure className="rounded-md border border-[#bcb7aa] bg-[#f5f0e5] p-3">
          <figcaption className="mb-2 font-mono text-xs font-semibold tracking-wide text-[#31302c] uppercase">
            {artifact.blocking.title}
          </figcaption>
          <svg
            viewBox="0 0 100 92"
            className="w-full"
            role="img"
            aria-label={artifact.blocking.title}
          >
            <rect width="100" height="92" fill="#f5f0e5" />
            {artifact.blocking.zones.map((zone) => (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="1"
                  fill="none"
                  stroke="#77736a"
                  strokeWidth="0.7"
                  strokeDasharray="2 1"
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2}
                  textAnchor="middle"
                  fontSize="4"
                  fill="#5f5b54"
                >
                  {zone.label}
                </text>
              </g>
            ))}
            {artifact.blocking.paths.map((path) => (
              <g key={path.label}>
                <polyline
                  points={path.points.map((point) => `${point.x},${point.y}`).join(" ")}
                  fill="none"
                  stroke="#9f3f35"
                  strokeWidth="1"
                  strokeDasharray="3 1"
                />
              </g>
            ))}
            {artifact.blocking.positions.map((position) => (
              <PositionMark key={`${position.kind}-${position.label}`} position={position} />
            ))}
          </svg>
          <div className="mt-2 grid gap-2 border-t border-[#c9c3b5] pt-2 text-[0.68rem] text-[#625f57] sm:grid-cols-2">
            <p>
              <span className="font-semibold text-[#31302c]">Marks:</span>{" "}
              {artifact.blocking.positions
                .map((position) => `${position.kind.toLowerCase()} ${position.label}`)
                .join(" · ")}
            </p>
            <p>
              <span className="font-semibold text-[#31302c]">Paths:</span>{" "}
              {artifact.blocking.paths.map((path) => path.label).join(" · ")}
            </p>
          </div>
        </figure>

        <aside className="rounded-md border border-[#bcb7aa] bg-[#f5f0e5] p-3 text-[#31302c]">
          <h3 className="font-mono text-xs font-semibold tracking-wide uppercase">
            {artifact.look.title}
          </h3>
          <div className="mt-3 space-y-3">
            {artifact.look.swatches.map((swatch) => (
              <div key={swatch.name} className="grid grid-cols-[2rem_1fr] items-start gap-2">
                <span
                  className="h-8 w-8 rounded-sm border border-black/20"
                  style={{ backgroundColor: swatch.color }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-semibold">{swatch.name}</p>
                  <p className="text-[0.7rem] text-[#625f57]">{swatch.use}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-[#c9c3b5] pt-3 text-xs leading-relaxed text-[#625f57]">
            {artifact.look.texture}
          </p>
        </aside>
      </div>
    </section>
  );
}
