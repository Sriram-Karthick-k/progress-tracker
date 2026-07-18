"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

// Renders pre-built markdown HTML and draws any ```mermaid diagrams client-side.
export function NotebookContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const blocks = Array.from(el.querySelectorAll("pre.mermaid")) as HTMLElement[];
    if (blocks.length === 0) return;
    let cancelled = false;
    import("mermaid").then((m) => {
      if (cancelled) return;
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: resolved === "dark" ? "dark" : "default",
        securityLevel: "loose",
      });
      blocks.forEach((b) => b.removeAttribute("data-processed"));
      mermaid.run({ nodes: blocks }).catch(() => {});
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  return <div ref={ref} className="md-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
