"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useProgress } from "./ProgressProvider";

export function ConfidenceStars({ id }: { id: string }) {
  const { get, update } = useProgress();
  const value = get(id).confidence;
  const [hover, setHover] = useState(0);

  function set(v: number) {
    update(id, { confidence: value === v ? v - 1 : v }); // click same star to decrement
  }

  return (
    <div className="flex items-center gap-0.5" title={`Confidence ${value}/5`}>
      {[1, 2, 3, 4, 5].map((v) => {
        const active = (hover || value) >= v;
        return (
          <button
            key={v}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => set(v)}
            className="p-0.5 transition active:scale-90"
          >
            <Star size={15} className={active ? "fill-amber-400 text-amber-400" : "text-slate-600"} />
          </button>
        );
      })}
    </div>
  );
}
