"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <div className="group relative">
      <button
        onClick={copy}
        title="Copy"
        className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 opacity-0 transition hover:border-white/20 hover:text-white group-hover:opacity-100"
      >
        {copied ? (
          <>
            <Check size={12} className="text-emerald-400" /> Copied
          </>
        ) : (
          <>
            <Copy size={12} /> Copy
          </>
        )}
      </button>
      {/* code stays dark-themed in both modes, so pin a light text color */}
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0b1120] p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-[#e2e8f0]">{code}</code>
      </pre>
    </div>
  );
}
