"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { STATUS_META, Status, nextStatus } from "@/lib/status";
import { patchEntity, EntityKind } from "@/lib/client";

export function StatusToggle({
  kind,
  id,
  status,
}: {
  kind: EntityKind;
  id: number;
  status: Status;
}) {
  const router = useRouter();
  const [val, setVal] = useState<Status>(status);
  const [, startTransition] = useTransition();

  useEffect(() => setVal(status), [status]);

  function cycle() {
    const next = nextStatus(val);
    setVal(next); // optimistic
    startTransition(async () => {
      await patchEntity(kind, id, { status: next });
      router.refresh();
    });
  }

  const meta = STATUS_META[val];
  return (
    <button
      onClick={cycle}
      title="Click to cycle: To do → Attempted → Learning → Done"
      className={`inline-flex min-w-[92px] items-center justify-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide transition active:scale-95 ${meta.pill}`}
    >
      {meta.label}
    </button>
  );
}
