"""
2_index_chunks.py
Gera embeddings via OpenAI e indexa os chunks no Supabase pgvector.

Pré-requisitos:
  - setup.sql já rodado no Supabase SQL Editor
  - .env preenchido com SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY

Uso: python 2_index_chunks.py

Custo estimado: ~$0.001 para 476 chunks com text-embedding-3-small
"""

import os
import json
import time
from dotenv import load_dotenv
from supabase import create_client
from openai import OpenAI

load_dotenv()

SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
OPENAI_API_KEY       = os.environ["OPENAI_API_KEY"]

JSONL_PATH   = "pm_rag_chunks.jsonl"   # mesmo diretório do script
EMBED_MODEL  = "text-embedding-3-small"
BATCH_SIZE   = 50   # chunks por batch de embedding
INSERT_BATCH = 25   # chunks por insert no Supabase

def load_chunks():
    chunks = []
    with open(JSONL_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))
    print(f"Carregados {len(chunks)} chunks de {JSONL_PATH}")
    return chunks

def get_embeddings(texts, client):
    """Gera embeddings em batch via OpenAI."""
    response = client.embeddings.create(
        model=EMBED_MODEL,
        input=texts
    )
    return [item.embedding for item in response.data]

def chunk_to_row(chunk, embedding):
    """Converte chunk dict + embedding para row do Supabase."""
    return {
        "id":              chunk["chunk_id"],
        "video_id":        chunk["video_id"],
        "titulo":          chunk["titulo"],
        "empresa_alvo":    chunk["empresa_alvo"],
        "tipo_entrevista": chunk["tipo_entrevista"],
        "produto_caso":    chunk["produto_caso"],
        "dimensoes":       chunk["dimensoes_cobertas"],
        "candidato_nivel": chunk["candidato_nivel"],
        "qualidade":       chunk["qualidade_resposta"],
        "notas_rag":       chunk.get("notas_rag", "")[:500],
        "word_count":      chunk["word_count"],
        "content":         chunk["text"],
        "embedding":       embedding,
    }

def main():
    chunks    = load_chunks()
    oai       = OpenAI(api_key=OPENAI_API_KEY)
    supabase  = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    all_rows = []
    total_embedded = 0

    # Gera embeddings em batches
    for i in range(0, len(chunks), BATCH_SIZE):
        batch  = chunks[i:i + BATCH_SIZE]
        texts  = [c["text"] for c in batch]
        embeds = get_embeddings(texts, oai)

        for chunk, emb in zip(batch, embeds):
            all_rows.append(chunk_to_row(chunk, emb))

        total_embedded += len(batch)
        print(f"  Embeddings gerados: {total_embedded}/{len(chunks)}")
        time.sleep(0.2)  # respeitar rate limit

    print(f"\nTotal de rows prontos: {len(all_rows)}")
    print("Inserindo no Supabase...")

    # Insere em batches menores no Supabase
    total_inserted = 0
    for i in range(0, len(all_rows), INSERT_BATCH):
        batch = all_rows[i:i + INSERT_BATCH]
        supabase.table("pm_chunks").upsert(batch).execute()
        total_inserted += len(batch)
        print(f"  Inseridos: {total_inserted}/{len(all_rows)}")

    print(f"\nIndexação completa! {total_inserted} chunks no Supabase.")

    # Verificação final
    count = supabase.table("pm_chunks").select("id", count="exact").execute()
    print(f"Verificação: {count.count} rows na tabela pm_chunks")

if __name__ == "__main__":
    main()
