"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

// Shares the result to LinkedIn and offers a copy-link fallback.
export function ShareButton({
  product,
  seniority,
}: {
  product: string;
  seniority: string;
}) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin : "https://casefy.app";

  const text = t.share.text(product, seniority);

  function shareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    // LinkedIn pulls the OG card from the URL; copy the blurb for the post body.
    navigator.clipboard?.writeText(text).catch(() => {});
    window.open(url, "_blank", "noopener,noreferrer,width=620,height=640");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        onClick={shareLinkedIn}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
        {t.share.linkedin}
      </button>
      <button
        onClick={copyLink}
        className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-white"
      >
        {copied ? t.share.copied : t.share.copy}
      </button>
    </div>
  );
}
