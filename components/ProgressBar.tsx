import { STATUSES, STATUS_META, Status } from "@/lib/status";

export function ProgressBar({
  counts,
  total,
  className = "",
}: {
  counts: Record<Status, number>;
  total: number;
  className?: string;
}) {
  return (
    <div
      className={`flex h-2.5 w-full overflow-hidden rounded-full bg-slate-950/70 ring-1 ring-inset ring-white/5 ${className}`}
    >
      {total > 0 &&
        STATUSES.filter((s) => s !== "TODO").map((s) => {
          const w = (100 * counts[s]) / total;
          if (w <= 0) return null;
          return (
            <div
              key={s}
              style={{ width: `${w}%`, backgroundColor: STATUS_META[s].color }}
              className="h-full transition-all"
            />
          );
        })}
    </div>
  );
}
