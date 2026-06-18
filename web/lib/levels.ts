// Difficulty levels picked before an interview. Must mirror LEVELS in the
// backend (4_interview_agent.py). `id` is what's sent to /session/start.
// Labels and blurbs are localized — see lib/i18n.ts (dict.levels.items).

export type LevelId = "junior" | "mid" | "senior" | "staff";

export interface Level {
  id: LevelId;
  emoji: string;
}

export const LEVELS: Level[] = [
  { id: "junior", emoji: "🌱" },
  { id: "mid", emoji: "🚀" },
  { id: "senior", emoji: "🎯" },
  { id: "staff", emoji: "👑" },
];

export const DEFAULT_LEVEL: LevelId = "mid";

export function findLevel(id: string | null | undefined): Level | undefined {
  if (!id) return undefined;
  return LEVELS.find((l) => l.id === id);
}
