"use client";

import { LANGS } from "@/lib/i18n";
import { useLang } from "./LangProvider";

// Compact PT/EN switch.
export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 text-xs">
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          className={`rounded-md px-2 py-1 font-medium transition-colors ${
            lang === l.id
              ? "bg-accent text-white"
              : "text-muted hover:text-white"
          }`}
          aria-pressed={lang === l.id}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
