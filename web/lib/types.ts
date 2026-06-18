// Shared types mirroring the FastAPI backend (5_api.py)

export const DIMENSIONS = [
  "Product Sense",
  "Execution",
  "Data & Metrics",
  "AI Fluency",
  "Communication",
  "Leadership",
  "Seniority Signal",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export type Seniority = "Junior PM" | "Mid PM" | "Senior PM" | "Staff PM" | string;

export interface StartResponse {
  session_id: string;
  case_title: string;
  case_description: string;
  opening_question: string;
  current_dim: Dimension;
  dim_index: number;
  is_done: boolean;
  level?: string;
  level_label?: string;
}

export interface RespondResponse {
  reply: string;
  current_dim: Dimension;
  dim_index: number;
  is_done: boolean;
}

export interface EvaluateResponse {
  seniority: Seniority;
  overall_summary: string;
  scores: Record<Dimension, number>;
  feedback: Record<Dimension, string>;
}

export interface ChatMessage {
  role: "agent" | "user";
  content: string;
  dim?: Dimension;
}
