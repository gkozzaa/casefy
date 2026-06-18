"use client";

// FIFA-style 7-axis radar chart, rendered as pure SVG (no chart deps).
// Scores are on a 0–10 scale (matching the backend evaluator).

import { DIMENSIONS, type Dimension } from "@/lib/types";

interface Props {
  scores: Record<Dimension, number>;
  size?: number;
  max?: number;
}

// Short labels so the heptagon stays legible.
const SHORT: Record<Dimension, string> = {
  "Product Sense": "PRD",
  Execution: "EXE",
  "Data & Metrics": "DAT",
  "AI Fluency": "AI",
  Communication: "COM",
  Leadership: "LDR",
  "Seniority Signal": "SNR",
};

export function RadarChart({ scores, size = 340, max = 10 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const n = DIMENSIONS.length;

  // Vertex position for an axis i at a given value ratio (0..1).
  const point = (i: number, ratio: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    };
  };

  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = DIMENSIONS.map((dim, i) => {
    const v = Math.max(0, Math.min(max, scores[dim] ?? 0));
    return point(i, v / max);
  });

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label="Skill radar chart"
    >
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6C63D4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#534AB7" stopOpacity="0.25" />
        </radialGradient>
      </defs>

      {/* Concentric guide rings */}
      {rings.map((r, idx) => {
        const ring = DIMENSIONS.map((_, i) => point(i, r));
        const d =
          ring.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
          " Z";
        return (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke="#2A2A38"
            strokeWidth={1}
          />
        );
      })}

      {/* Axes */}
      {DIMENSIONS.map((_, i) => {
        const outer = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="#2A2A38"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="url(#radarFill)"
        stroke="#6C63D4"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data vertices */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#fff" />
      ))}

      {/* Labels + values */}
      {DIMENSIONS.map((dim, i) => {
        const label = point(i, 1.18);
        const v = Math.round((scores[dim] ?? 0) * 10) / 10;
        return (
          <g key={dim}>
            <text
              x={label.x}
              y={label.y - 4}
              textAnchor="middle"
              className="fill-muted"
              fontSize={11}
              fontWeight={600}
            >
              {SHORT[dim]}
            </text>
            <text
              x={label.x}
              y={label.y + 9}
              textAnchor="middle"
              className="fill-white"
              fontSize={12}
              fontWeight={700}
            >
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
