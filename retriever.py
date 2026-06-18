"""
3_retriever.py
Módulo de retrieval semântico — chamado pelo agente durante o live case.

Uso direto para teste:
    python 3_retriever.py

Uso como módulo:
    from retriever import PMRetriever
    r = PMRetriever()
    results = r.query("how to prioritize features", dimensao="Execution")
"""

import os
from dotenv import load_dotenv
from supabase import create_client
from openai import OpenAI

load_dotenv()

SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
OPENAI_API_KEY       = os.environ["OPENAI_API_KEY"]
EMBED_MODEL          = "text-embedding-3-small"


class PMRetriever:
    def __init__(self):
        self.oai      = OpenAI(api_key=OPENAI_API_KEY)
        self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    def _embed(self, text: str) -> list[float]:
        resp = self.oai.embeddings.create(model=EMBED_MODEL, input=text)
        return resp.data[0].embedding

    def query(
        self,
        text: str,
        dimensao: str | None = None,        # ex: "Execution"
        qualidade_minima: str = "good",     # "good" | "excellent"
        n_results: int = 3,
        threshold: float = 0.4,
    ) -> list[dict]:
        """
        Busca chunks semanticamente similares com filtros opcionais.

        Retorna lista de dicts com: content, titulo, empresa_alvo,
        produto_caso, dimensoes, candidato_nivel, qualidade, similarity
        """
        embedding = self._embed(text)

        qualidade_filter = (
            ["excellent"] if qualidade_minima == "excellent"
            else ["good", "excellent"]
        )

        result = self.supabase.rpc(
            "search_pm_chunks",
            {
                "query_embedding":  embedding,
                "match_threshold":  threshold,
                "match_count":      n_results,
                "filter_dimensao":  dimensao,
                "filter_qualidade": qualidade_filter,
            }
        ).execute()

        return result.data or []

    def format_for_prompt(self, results: list[dict]) -> str:
        """
        Formata os resultados como contexto para o system prompt do agente.
        """
        if not results:
            return "Nenhum exemplo relevante encontrado."

        lines = ["### Exemplos de referência (mock interviews reais)\n"]
        for i, r in enumerate(results, 1):
            lines.append(
                f"**Exemplo {i}** | {r['empresa_alvo']} | {r['candidato_nivel']} | "
                f"Qualidade: {r['qualidade']} | Similaridade: {r['similarity']:.2f}\n"
                f"Produto: {r['produto_caso']}\n"
                f"{r['content']}\n"
            )
        return "\n---\n".join(lines)


# ── Teste de sanidade quando rodado diretamente ──────────────────────────────

TEST_QUERIES = [
    {
        "text": "how to define success metrics and north star metric for a consumer product",
        "dimensao": "Data & Metrics",
        "label": "Metrics / North Star",
    },
    {
        "text": "how to prioritize features with limited engineering resources",
        "dimensao": "Execution",
        "label": "Prioritization",
    },
    {
        "text": "how to identify and segment target users for a new product",
        "dimensao": "Product Sense",
        "label": "User Segmentation",
    },
]

if __name__ == "__main__":
    print("Inicializando retriever...\n")
    r = PMRetriever()

    for q in TEST_QUERIES:
        print(f"{'='*60}")
        print(f"QUERY: {q['label']}")
        print(f"Texto: {q['text']}")
        print(f"Filtro dimensão: {q['dimensao']}\n")

        results = r.query(q["text"], dimensao=q["dimensao"], n_results=3)

        if not results:
            print("  ⚠ Nenhum resultado acima do threshold.\n")
            continue

        for i, res in enumerate(results, 1):
            print(f"  [{i}] {res['titulo'][:55]}")
            print(f"       Empresa: {res['empresa_alvo']} | Nível: {res['candidato_nivel']} | Sim: {res['similarity']:.3f}")
            print(f"       {res['content'][:200]}...\n")

        print("\nFormatado para prompt:")
        print(r.format_for_prompt(results[:2]))
        print()
