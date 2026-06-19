"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { findProduct } from "@/lib/products";
import { findLevel } from "@/lib/levels";
import { DIMENSIONS, type Dimension, type EvaluateResponse } from "@/lib/types";
import { RadarChart } from "@/components/RadarChart";
import { SeniorityBadge } from "@/components/SeniorityBadge";
import { ShareButton } from "@/components/ShareButton";
import { Logo } from "@/components/Logo";
import { useLang } from "@/components/LangProvider";

interface Stored {
  product: string;
  level?: string;
  result: EvaluateResponse;
}

export default function ResultPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;
  const { t } = useLang();
  const [data, setData] = useState<Stored | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prefer the cached evaluation (backend sessions are in-memory).
    const cached = sessionStorage.getItem(`casefy:result:${sessionId}`);
    if (cached) {
      try {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {
        /* fall through to refetch */
      }
    }

    // Fallback: ask the backend to (re)evaluate if the session still lives.
    api
      .evaluate(sessionId)
      .then((result) =>
        setData({ product: "your product", result })
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <CenteredShell>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="mt-4 text-sm text-muted">{t.result.loading}</p>
      </CenteredShell>
    );
  }

  if (error || !data) {
    return (
      <CenteredShell>
        <div className="max-w-md text-center">
          <div className="text-3xl">🗂️</div>
          <p className="mt-3 text-muted">{t.result.expired}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-soft"
          >
            {t.result.newCase}
          </Link>
        </div>
      </CenteredShell>
    );
  }

  const { product, level, result } = data;
  const meta = findProduct(product);
  const levelMeta = findLevel(level);
  const levelLabel = level
    ? t.levels.items[level as keyof typeof t.levels.items]?.label
    : undefined;
  const avg =
    DIMENSIONS.reduce((sum, d) => sum + (result.scores[d] ?? 0), 0) /
    DIMENSIONS.length;

  return (
    <div className="min-h-screen bg-grid pb-20">
      {/* Header */}
      <header className="border-b border-border/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold">PMCasefy</span>
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-white"
          >
            {t.result.again}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-10">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>{meta?.emoji ?? "🎯"}</span>
          <span>{t.result.scorecardOf(product)}</span>
          {levelMeta && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-white">
              {levelMeta.emoji} {t.result.levelTag(levelLabel ?? "")}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t.result.title}
        </h1>

        {/* Top row: radar + badge/summary */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-semibold">{t.result.radar}</h2>
              <span className="text-sm text-muted">
                {t.result.avg}{" "}
                <span className="font-semibold text-white">
                  {avg.toFixed(1)}
                </span>
                /10
              </span>
            </div>
            <RadarChart scores={result.scores} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <SeniorityBadge seniority={result.seniority} />
              <p className="mt-4 text-center text-sm leading-relaxed text-muted">
                {result.overall_summary}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="mb-3 text-sm font-semibold">
                {t.result.shareTitle}
              </h3>
              <ShareButton product={product} seniority={result.seniority} />
            </div>
          </div>
        </div>

        {/* Per-dimension feedback */}
        <h2 className="mb-4 mt-12 text-xl font-bold tracking-tight">
          {t.result.breakdown}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DIMENSIONS.map((dim) => (
            <DimensionCard
              key={dim}
              dim={dim}
              score={result.scores[dim] ?? 0}
              feedback={result.feedback[dim] ?? "—"}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
          <h3 className="text-xl font-semibold">{t.result.again}</h3>
          <p className="text-sm text-muted">{t.result.againSub}</p>
          <Link
            href="/#products"
            className="mt-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-soft"
          >
            {t.result.pickProduct}
          </Link>
        </div>
      </main>
    </div>
  );
}

function DimensionCard({
  dim,
  score,
  feedback,
}: {
  dim: Dimension;
  score: number;
  feedback: string;
}) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const tone =
    score >= 7 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-red-400";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{dim}</h3>
        <span className={`text-lg font-bold ${tone}`}>{score}/10</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{feedback}</p>
    </div>
  );
}

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      {children}
    </div>
  );
}
