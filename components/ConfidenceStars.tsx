"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { patchEntity, EntityKind } from "@/lib/client";

export function ConfidenceStars({
  kind,
  id,
  confidence,
}: {
  kind: EntityKind;
  id: number;
  confidence: number;
}) {
  const router = useRouter();
  const [val, setVal] = useState(confidence);
  const [hover, setHover] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => setVal(confidence), [confidence]);

  function set(v: number) {
    const next = val === v ? v - 1 : v; // click the same star to decrement
    setVal(next);
    startTransition(async () => {
      await patchEntity(kind, id, { confidence: next });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-0.5" title={`Confidence ${val}/5`}>
      {[1, 2, 3, 4, 5].map((v) => {
        const active = (hover || val) >= v;
        return (
          <button
            key={v}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => set(v)}
            className="p-0.5 transition active:scale-90"
          >
            <Star
              size={15}
              className={
                active ? "fill-amber-400 text-amber-400" : "text-slate-600"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
