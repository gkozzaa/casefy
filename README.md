# PM Interview RAG Pipeline

Pipeline completo para indexar transcrições de mock PM interviews no Supabase pgvector.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `.env.example` | Template de credenciais — copie para `.env` e preencha |
| `setup.sql` | Cole e rode no Supabase SQL Editor — cria tabela e função de busca |
| `0_build_chunks.py` | Lê TXTs + planilha de metadados → gera `pm_rag_chunks.jsonl` |
| `pm_rag_chunks.jsonl` | 476 chunks já gerados dos 5 vídeos |
| `2_index_chunks.py` | Gera embeddings (OpenAI) e indexa no Supabase |
| `3_retriever.py` | Módulo de busca semântica usado pelo agente |

## Ordem de execução

```bash
# 1. Instalar dependências
pip install supabase openai python-dotenv openpyxl

# 2. Configurar credenciais
cp .env.example .env
# editar .env com suas keys

# 3. Rodar setup.sql no Supabase SQL Editor

# 4. Indexar (só precisa rodar uma vez)
python 2_index_chunks.py

# 5. Testar retrieval
python 3_retriever.py
```

## Custo estimado

- OpenAI text-embedding-3-small: ~$0.001 para 476 chunks
- Supabase: free tier (500MB, suficiente para milhares de chunks)

## Como adicionar mais vídeos

1. Adicionar transcrições TXT em `uploads/`
2. Preencher novas linhas na planilha `pm_interviews_metadata.xlsx`
3. Rodar `python 0_build_chunks.py` (gera novo JSONL)
4. Rodar `python 2_index_chunks.py` (upsert — não duplica)

## Integração com o agente

```python
from retriever import PMRetriever

retriever = PMRetriever()

# Durante a entrevista, antes de formular a próxima pergunta:
examples = retriever.query(
    text=candidato_resposta,
    dimensao="Execution",
    n_results=3
)
context = retriever.format_for_prompt(examples)
# injeta `context` no system prompt do agente
```
