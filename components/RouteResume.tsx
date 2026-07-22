"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLastRoute, getScrollFor } from "@/lib/progress";
import { useProgress } from "./ProgressProvider";

/**
 * Resume-where-you-left-off. On a fresh page load that lands on the root
 * route, jump straight to whatever page (and filters, via the query string)
 * you were last on, then restore your scroll position — no click needed.
 * "Last route" is captured automatically whenever you leave a page (tab
 * switch, close, navigate away — see flushOnHide in lib/progress.ts), so
 * there's nothing to opt into; closing and reopening just puts you back.
 *
 * Runs exactly once per full page load (tracked via `phase`, a plain ref —
 * not state — so it never re-triggers on normal in-app navigation). Renders
 * nothing.
 */
export function RouteResume() {
  const { ready } = useProgress();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const phase = useRef<"idle" | "redirecting" | "done">("idle");

  useEffect(() => {
    if (!ready || phase.current === "done") return;

    const qs = searchParams.toString();
    const current = qs ? `${pathname}?${qs}` : pathname;

    if (phase.current === "idle") {
      const saved = getLastRoute();
      if (pathname === "/" && saved && saved !== "/" && saved !== current) {
        phase.current = "redirecting";
        router.replace(saved);
        return; // effect re-fires once the route actually changes below
      }
    }
    phase.current = "done";

    const y = getScrollFor(current);
    if (y != null) {
      // double rAF: let the landed page's content paint before scrolling to it
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    }
  }, [ready, pathname, searchParams, router]);

  return null;
}
