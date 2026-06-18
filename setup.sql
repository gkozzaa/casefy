-- =============================================================
-- SETUP: cole e rode no Supabase > SQL Editor
-- =============================================================

-- 1. Garante extensão pgvector ativa
create extension if not exists vector;

-- 2. Remove tabela anterior se existir (útil pra re-setup)
drop table if exists pm_chunks;

-- 3. Tabela principal de chunks
create table pm_chunks (
    id              text primary key,
    video_id        text not null,
    titulo          text,
    empresa_alvo    text,
    tipo_entrevista text,
    produto_caso    text,
    dimensoes       text[],        -- array: {'Product Sense','Execution',...}
    candidato_nivel text,
    qualidade       text,          -- 'good' | 'excellent'
    notas_rag       text,
    word_count      int,
    content         text not null,
    embedding       vector(1536)   -- OpenAI text-embedding-3-small
);

-- 4. Índice HNSW para busca vetorial eficiente (cosine similarity)
create index on pm_chunks
using hnsw (embedding vector_cosine_ops)
with (m = 16, ef_construction = 64);

-- 5. Função de busca semântica com filtros opcionais
create or replace function search_pm_chunks(
    query_embedding  vector(1536),
    match_threshold  float   default 0.4,
    match_count      int     default 5,
    filter_dimensao  text    default null,
    filter_qualidade text[]  default null
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
    order by c.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- Verificar se criou certo
select count(*) from pm_chunks;
