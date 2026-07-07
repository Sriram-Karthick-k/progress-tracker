"use client";

import { Flag } from "lucide-react";
import { useProgress } from "./ProgressProvider";

export function RevisitFlag({ id }: { id: string }) {
  const { get, update } = useProgress();
  const on = get(id).revisit;

  return (
    <button
      onClick={() => update(id, { revisit: !on })}
      title={on ? "Flagged to revisit" : "Flag for revisit"}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition active:scale-90 ${
        on
          ? "border-orange-500/70 bg-orange-500/15 text-orange-400"
          : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
      }`}
    >
      <Flag size={15} className={on ? "fill-orange-400" : ""} />
    </button>
  );
}
