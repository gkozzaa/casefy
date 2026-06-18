"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/useAuth";
import { useLang } from "@/components/LangProvider";

function PricingScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const { t } = useLang();
  const P = t.pricing;

  const reason = params.get("reason"); // "limit" when bounced from the gate
  const status = params.get("status"); // "success" | "cancelled" from Stripe

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<{
    isPro: boolean;
    remainingFree: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/entitlement")
      .then((r) => (r.ok ? r.json() : null))
      .then((e) => e && setEntitlement(e))
      .catch(() => {});
  }, [user, status]);

  async function upgrade() {
    if (!user) {
      router.push("/login?next=/pricing");
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error || "Checkout failed");
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setCheckoutLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        {status === "success" && (
          <Banner tone="success">
            {P.successBanner}{" "}
            <Link href="/#products" className="underline">
              {P.successCta}
            </Link>
          </Banner>
        )}
        {status === "cancelled" && (
          <Banner tone="neutral">{P.cancelledBanner}</Banner>
        )}
        {reason === "limit" && status !== "success" && (
          <Banner tone="accent">{P.limitBanner}</Banner>
        )}

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">{P.title}</h1>
          <p className="mt-3 text-muted">{P.sub}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {P.freeName}
            </h2>
            <div className="mt-3 text-4xl font-bold">$0</div>
            <p className="mt-1 text-sm text-muted">{P.freeTagline}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {P.freeFeatures.map((f) => (
                <Feature key={f}>{f}</Feature>
              ))}
            </ul>
            <Link
              href="/#products"
              className="mt-8 block rounded-xl border border-border py-3 text-center text-sm font-medium text-muted transition-colors hover:border-accent hover:text-white"
            >
              {entitlement && entitlement.remainingFree > 0
                ? P.useFree
                : P.freeUsed}
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-accent bg-surface p-8 glow-accent">
            <div className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold">
              {P.popular}
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-soft">
              {P.proName}
            </h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-sm text-muted">{P.oneTime}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{P.proTagline}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {P.proFeatures.map((f, i) => (
                <Feature key={f} highlight={i === 1}>
                  {f}
                </Feature>
              ))}
            </ul>

            {entitlement?.isPro ? (
              <div className="mt-8 rounded-xl bg-accent/15 py-3 text-center text-sm font-semibold text-accent-soft">
                {P.youArePro}
              </div>
            ) : (
              <button
                onClick={upgrade}
                disabled={checkoutLoading || loading}
                className="mt-8 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-soft disabled:opacity-60"
              >
                {checkoutLoading ? P.redirecting : P.unlock}
              </button>
            )}
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted">{P.footnote}</p>
      </main>
    </>
  );
}

function Feature({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <span className={highlight ? "text-accent-soft" : "text-emerald-400"}>
        ✓
      </span>
      <span className={highlight ? "font-semibold" : "text-muted"}>
        {children}
      </span>
    </li>
  );
}

function Banner({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "neutral" | "accent";
}) {
  const styles = {
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    neutral: "border-border bg-surface text-muted",
    accent: "border-accent/40 bg-accent/10 text-white",
  }[tone];
  return (
    <div className={`mb-8 rounded-xl border p-4 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <PricingScreen />
    </Suspense>
  );
}
