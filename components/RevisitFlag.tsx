"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { patchEntity, EntityKind } from "@/lib/client";

export function RevisitFlag({
  kind,
  id,
  revisit,
}: {
  kind: EntityKind;
  id: number;
  revisit: boolean;
}) {
  const router = useRouter();
  const [val, setVal] = useState(revisit);
  const [, startTransition] = useTransition();

  useEffect(() => setVal(revisit), [revisit]);

  function toggle() {
    const next = !val;
    setVal(next);
    startTransition(async () => {
      await patchEntity(kind, id, { revisit: next });
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      title={val ? "Flagged to revisit" : "Flag for revisit"}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition active:scale-90 ${
        val
          ? "border-orange-500/70 bg-orange-500/15 text-orange-400"
          : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
      }`}
    >
      <Flag size={15} className={val ? "fill-orange-400" : ""} />
    </button>
  );
}
