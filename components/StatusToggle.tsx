"use client";

import { STATUS_META, nextStatus } from "@/lib/status";
import { useProgress } from "./ProgressProvider";

export function StatusToggle({ id }: { id: string }) {
  const { get, update } = useProgress();
  const status = get(id).status;
  const meta = STATUS_META[status];

  return (
    <button
      onClick={() => update(id, { status: nextStatus(status) })}
      title="Click to cycle: To do → Attempted → Learning → Done"
      className={`inline-flex min-w-[92px] items-center justify-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide transition active:scale-95 ${meta.pill}`}
    >
      {meta.label}
    </button>
  );
}
