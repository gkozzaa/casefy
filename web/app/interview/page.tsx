"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { findProduct } from "@/lib/products";
import { LEVELS, findLevel } from "@/lib/levels";
import { DIMENSIONS, type ChatMessage, type Dimension } from "@/lib/types";
import { DimensionProgress } from "@/components/DimensionProgress";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LangProvider";
import type { Dict } from "@/lib/i18n";

function InterviewScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, lang } = useLang();
  const product = params.get("product") || "Spotify";
  const meta = findProduct(product);
  const [level, setLevel] = useState<string | null>(params.get("level"));
  const levelMeta = findLevel(level);
  const levelLabel = level
    ? t.levels.items[level as keyof typeof t.levels.items]?.label
    : undefined;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dimIndex, setDimIndex] = useState(0);
  const [currentDim, setCurrentDim] = useState<Dimension>(DIMENSIONS[0]);
  const [isDone, setIsDone] = useState(false);
  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Gate: must pick a level, be signed in, and have an available case.
  useEffect(() => {
    if (!level) return; // wait for the level chooser
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(
          `/login?next=${encodeURIComponent(
            `/interview?product=${product}&level=${level}`
          )}`
        );
        return;
      }

      // Check entitlement.
      try {
        const res = await fetch("/api/entitlement");
        const ent = await res.json();
        if (!ent.canStartCase) {
          router.replace("/pricing?reason=limit");
          return;
        }
      } catch {
        /* if the gate check fails, fail open to the interview */
      }

      // Start the session.
      try {
        const start = await api.startSession(product, level, lang);
        if (cancelled) return;
        setSessionId(start.session_id);
        setCaseTitle(start.case_title);
        setCaseDescription(start.case_description);
        setCurrentDim(start.current_dim);
        setDimIndex(start.dim_index);
        setMessages([{ role: "agent", content: start.opening_question, dim: start.current_dim }]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t.interview.backendError
        );
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, level]);

  // Persist the picked level in the URL (survives the login round-trip).
  function pickLevel(id: string) {
    setLevel(id);
    router.replace(`/interview?product=${encodeURIComponent(product)}&level=${id}`);
  }

  // Keep the chat scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  async function send() {
    const answer = input.trim();
    if (!answer || !sessionId || thinking || isDone) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: answer }]);
    setThinking(true);
    setError(null);

    try {
      const res = await api.respond(sessionId, answer);
      setMessages((m) => [
        ...m,
        { role: "agent", content: res.reply, dim: res.current_dim },
      ]);
      setCurrentDim(res.current_dim);
      setDimIndex(res.dim_index);
      setIsDone(res.is_done);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.interview.sendError
      );
    } finally {
      setThinking(false);
    }
  }

  async function finish() {
    if (!sessionId) return;
    setEvaluating(true);
    setError(null);
    try {
      const result = await api.evaluate(sessionId);
      // Persist the result for the (in-memory backend) result page.
      sessionStorage.setItem(
        `casefy:result:${sessionId}`,
        JSON.stringify({ product, level, result })
      );
      // Meter the free tier.
      await fetch("/api/consume-case", { method: "POST" }).catch(() => {});
      router.push(`/result/${sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.interview.evalError
      );
      setEvaluating(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Step 1: choose a difficulty level before anything else.
  if (!level) {
    return (
      <LevelChooser
        product={product}
        productEmoji={meta?.emoji}
        onPick={pickLevel}
        t={t}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* Header */}
      <header className="border-b border-border/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-6 w-6" />
              <span className="font-semibold">PMCasefy</span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              {levelMeta && (
                <div className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1">
                  <span>{levelMeta.emoji}</span>
                  <span className="font-medium">{levelLabel}</span>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
                <span>{meta?.emoji ?? "🎯"}</span>
                <span className="font-medium">{product}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <DimensionProgress activeIndex={dimIndex} done={isDone} />
          </div>
        </div>
      </header>

      {/* Chat */}
      <div ref={scrollRef} className="scroll-slim flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {booting ? (
            <BootingState text={t.interview.generating(product)} />
          ) : (
            <>
              {/* Case briefing card */}
              {caseTitle && (
                <div className="mb-6 animate-fade-up rounded-2xl border border-accent/30 bg-accent/5 p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft">
                    {t.interview.yourCase}
                  </div>
                  <h1 className="mt-1 text-lg font-semibold">{caseTitle}</h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {caseDescription}
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <Bubble key={i} message={m} productEmoji={meta?.emoji} />
              ))}

              {thinking && <TypingBubble productEmoji={meta?.emoji} />}

              {isDone && (
                <div className="mt-6 animate-fade-up rounded-2xl border border-border bg-surface p-6 text-center">
                  <div className="text-2xl">🏁</div>
                  <h2 className="mt-2 text-lg font-semibold">
                    {t.interview.complete}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {t.interview.completeSub}
                  </p>
                  <button
                    onClick={finish}
                    disabled={evaluating}
                    className="mt-4 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-soft disabled:opacity-60"
                  >
                    {evaluating ? t.interview.scoring : t.interview.seeResults}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Composer */}
      {!isDone && !booting && (
        <div className="border-t border-border/60 bg-canvas">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-accent">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={t.interview.placeholder}
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted"
                disabled={thinking}
              />
              <button
                onClick={send}
                disabled={thinking || !input.trim()}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-soft disabled:opacity-40"
              >
                {t.interview.send}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">
              {t.interview.assessing}{" "}
              <span className="text-accent-soft">{currentDim}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({
  message,
  productEmoji,
}: {
  message: ChatMessage;
  productEmoji?: string;
}) {
  const isAgent = message.role === "agent";
  return (
    <div
      className={`mb-4 flex animate-fade-up gap-3 ${
        isAgent ? "" : "flex-row-reverse"
      }`}
    >
      <div
        className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm ${
          isAgent ? "bg-accent/20" : "bg-elevated"
        }`}
      >
        {isAgent ? productEmoji ?? "🤖" : "🧑‍💻"}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAgent
            ? "rounded-tl-sm border border-border bg-surface"
            : "rounded-tr-sm bg-accent text-white"
        }`}
      >
        {isAgent && message.dim && (
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-accent-soft">
            {message.dim}
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

function TypingBubble({ productEmoji }: { productEmoji?: string }) {
  return (
    <div className="mb-4 flex gap-3">
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent/20 text-sm">
        {productEmoji ?? "🤖"}
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted animate-pulse-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function BootingState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="mt-4 text-sm text-muted">{text}</p>
    </div>
  );
}

function LevelChooser({
  product,
  productEmoji,
  onPick,
  t,
}: {
  product: string;
  productEmoji?: string;
  onPick: (id: string) => void;
  t: Dict;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-grid">
      <header className="border-b border-border/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold">PMCasefy</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm">
            <span>{productEmoji ?? "🎯"}</span>
            <span className="font-medium">{product}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t.levels.title}
          </h1>
          <p className="mt-2 text-sm text-muted">{t.levels.sub}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.map((lvl) => {
            const item = t.levels.items[lvl.id];
            return (
              <button
                key={lvl.id}
                onClick={() => onPick(lvl.id)}
                className="group rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lvl.emoji}</span>
                  <span className="text-lg font-semibold">{item.label}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{item.blurb}</p>
                <div className="mt-3 text-sm font-medium text-accent-soft opacity-0 transition-opacity group-hover:opacity-100">
                  {t.levels.start}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <InterviewScreen />
    </Suspense>
  );
}
