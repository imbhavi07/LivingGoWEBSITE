"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyLinkButton({ link }: { link: string | null }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      disabled={!link}
      className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-linen hover:opacity-90 disabled:opacity-40"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function RequestPayoutButton() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/affiliate/payout-request", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return <p className="mt-3 text-center text-xs font-medium text-moss">Payout requested ✓</p>;
  }

  return (
    <button
      onClick={submit}
      disabled={submitting}
      className="mt-3 w-full rounded-lg bg-moss py-2 text-xs font-medium text-linen hover:opacity-90 disabled:opacity-50"
    >
      {submitting ? "Requesting…" : "Request payout"}
    </button>
  );
}