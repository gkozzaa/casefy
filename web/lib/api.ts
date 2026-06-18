// Thin client for the FastAPI interview backend (5_api.py).
import type {
  StartResponse,
  RespondResponse,
  EvaluateResponse,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* keep statusText */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  startSession: (product: string, level?: string, language?: string) =>
    request<StartResponse>("/session/start", {
      method: "POST",
      body: JSON.stringify({ product, level, language }),
    }),

  respond: (sessionId: string, answer: string) =>
    request<RespondResponse>("/session/respond", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, answer }),
    }),

  evaluate: (sessionId: string) =>
    request<EvaluateResponse>(`/session/${sessionId}/evaluate`, {
      method: "POST",
    }),
};
