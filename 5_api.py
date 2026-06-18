"""
5_api.py
API REST para conectar o backend de entrevista com qualquer frontend.

Endpoints:
  POST /session/start        → cria sessão e retorna caso gerado
  POST /session/respond      → envia resposta, retorna próxima pergunta
  GET  /session/{id}/status  → retorna estado atual da sessão
  POST /session/{id}/evaluate → avalia e retorna scores + radar

Uso:
  pip install fastapi uvicorn
  uvicorn 5_api:app --reload --port 8000
"""

import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from interview_agent import InterviewSession

app = FastAPI(title="PM Interview API")

# Permite chamadas do frontend (ajuste origins em produção)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sessões em memória (em produção: Redis ou Supabase)
sessions: dict[str, InterviewSession] = {}


# ── Schemas ───────────────────────────────────────────────────────────────────

class StartRequest(BaseModel):
    product: str
    level: str | None = None      # junior | mid | senior | staff (default: mid)
    language: str | None = None   # pt | en (default: pt)

class RespondRequest(BaseModel):
    session_id: str
    answer: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/session/start")
async def start_session(req: StartRequest):
    session_id = str(uuid.uuid4())
    session = InterviewSession(product_name=req.product, level=req.level,
                               language=req.language)
    case = session.generate_case()
    sessions[session_id] = session

    return {
        "session_id":   session_id,
        "case_title":   case["case_title"],
        "case_description": case["case_description"],
        "opening_question": case["opening_question"],
        "current_dim":  session.current_dim,
        "dim_index":    session.dim_idx,
        "is_done":      session.is_done,
        "level":        session.level,
        "level_label":  session.level_cfg["label"],
        "language":     session.language,
    }


@app.post("/session/respond")
async def respond(req: RespondRequest):
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    if session.is_done:
        raise HTTPException(status_code=400, detail="Entrevista já encerrada")

    reply = session.respond(req.answer)

    return {
        "reply":       reply,
        "current_dim": session.current_dim,
        "dim_index":   session.dim_idx,
        "is_done":     session.is_done,
    }


@app.post("/session/{session_id}/evaluate")
async def evaluate(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    if not session.is_done:
        raise HTTPException(status_code=400, detail="Entrevista ainda não encerrada")

    result = session.evaluate()
    return result


@app.get("/session/{session_id}/status")
async def status(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    return {
        "current_dim": session.current_dim,
        "dim_index":   session.dim_idx,
        "follow_ups":  session.follow_ups,
        "is_done":     session.is_done,
        "exchanges":   len(session.exchanges),
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
