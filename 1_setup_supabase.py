"""
1_setup_supabase.py
Cria a tabela pm_chunks com pgvector no Supabase.
Rode uma vez antes de indexar.

Uso: python 1_setup_supabase.py
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# SQL que cria a tabela e o índice vetorial
SETUP_SQL = """
-- Garante extensão ativa
create extension if not exists vector;

-- Remove tabela anterior se existir (útil pra re-setup)
drop table if exists pm_chunks;

-- Tabela principal
create table pm_chunks (
    id              text primary key,
    video_id        text not null,
    titulo          text,
    empresa_alvo    text,
    tipo_entrevista text,
    produto_caso    text,
    dimensoes       text[],          -- array de dimensões cobertas
    candidato_nivel text,
    qualidade       text,            -- poor / average / good / excellent
    notas_rag       text,
    word_count      int,
    content         text not null,   -- texto do chunk
    embedding       vector(1536)     -- OpenAI text-embedding-3-small = 1536 dims
);

-- Índice HNSW para busca vetorial eficiente
create index on pm_chunks
using hnsw (embedding vector_cosine_ops)
with (m = 16, ef_construction = 64);

-- Função de busca semântica com filtros opcionais
create or replace function search_pm_chunks(
    query_embedding vector(1536),
    match_threshold float default 0.5,
    match_count     int   default 5,
    filter_dimensao text  default null,
    filter_qualidade text[] default null,
    filter_nivel    text  default null
)
returns table (
    id              text,
    video_id        text,
    titulo          text,
    empresa_alvo    text,
    produto_caso    text,
    dimensoes       text[],
    candidato_nivel text,
    qualidade       text,
    notas_rag       text,
    content         text,
    similarity      float
)
language plpgsql
as $$
begin
    return query
    select
        c.id,
        c.video_id,
        c.titulo,
        c.empresa_alvo,
        c.produto_caso,
        c.dimensoes,
        c.candidato_nivel,
        c.qualidade,
        c.notas_rag,
        c.content,
        1 - (c.embedding <=> query_embedding) as similarity
    from pm_chunks c
    where
        1 - (c.embedding <=> query_embedding) > match_threshold
        and (filter_dimensao is null or filter_dimensao = any(c.dimensoes))
        and (filter_qualidade is null or c.qualidade = any(filter_qualidade))
        and (filter_nivel is null or c.candidato_nivel = filter_nivel)
    order by c.embedding <=> query_embedding
    limit match_count;
end;
$$;
"""

def main():
    print("Conectando ao Supabase...")
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    print("Rodando setup SQL...")
    # Executa via rpc de SQL direto (requer service key)
    result = client.rpc("query", {"sql": SETUP_SQL}).execute()
    print("Setup completo.")
    print("Tabela pm_chunks criada com índice HNSW e função search_pm_chunks.")

if __name__ == "__main__":
    main()
