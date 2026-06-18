"use client";

// Horizontal progress bar across the 7 interview dimensions.
import { DIMENSIONS } from "@/lib/types";

const SHORT: Record<string, string> = {
  "Product Sense": "Product",
  Execution: "Execution",
  "Data & Metrics": "Data",
  "AI Fluency": "AI",
  Communication: "Comms",
  Leadership: "Leadership",
  "Seniority Signal": "Seniority",
};

export function DimensionProgress({
  activeIndex,
  done,
}: {
  activeIndex: number;
  done: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-1.5">
      {DIMENSIONS.map((dim, i) => {
        const isDone = done || i < activeIndex;
        const isActive = !done && i === activeIndex;
        return (
          <div key={dim} className="flex flex-1 flex-col gap-1.5">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                isDone
                  ? "bg-accent"
                  : isActive
                    ? "bg-accent-soft animate-pulse-dot"
                    : "bg-border"
              }`}
            />
            <span
              className={`hidden text-[10px] font-medium sm:block ${
                isActive ? "text-white" : "text-muted"
              }`}
            >
              {SHORT[dim]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
