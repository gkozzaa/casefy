"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProductGrid } from "@/components/ProductGrid";
import { useLang } from "@/components/LangProvider";
import { DIMENSIONS } from "@/lib/types";

export default function LandingPage() {
  const { t } = useLang();
  const L = t.landing;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/30 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
            {L.badge}
          </div>

          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {L.h1a}
            <span className="bg-gradient-to-r from-accent-soft to-accent bg-clip-text text-transparent">
              {L.h1b}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{L.sub}</p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#products"
              className="rounded-xl bg-accent px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-soft glow-accent"
            >
              {L.startFree}
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-border px-7 py-3.5 text-base font-medium text-muted transition-colors hover:border-accent hover:text-white"
            >
              {L.seePricing}
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted">{L.freeNote}</p>
        </div>
      </section>

      {/* Dimensions strip */}
      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-5 text-sm text-muted">
          <span className="font-medium text-white">{L.scoredAcross}</span>
          {DIMENSIONS.map((d) => (
            <span key={d} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-accent-soft" />
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {L.productsTitle}
          </h2>
          <p className="mt-2 text-muted">{L.productsSub}</p>
        </div>
        <ProductGrid />
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
            {L.howTitle}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {L.steps.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="text-sm font-bold text-accent-soft">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight">{L.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">{L.ctaSub}</p>
        <Link
          href="#products"
          className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-soft glow-accent"
        >
          {L.startFree}
        </Link>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-muted">
          © {new Date().getFullYear()} Casefy — {L.footer}
        </div>
      </footer>
    </>
  );
}
