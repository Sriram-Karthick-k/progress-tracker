import { Result } from "@/lib/sqlsheet";

export function ResultTable({ result }: { result: Result }) {
  if (result.empty || result.columns.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-emerald-500/[0.04] px-3 py-2 text-xs text-slate-400">
        {result.empty ?? "(no rows)"}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03]">
      <div className="flex items-center gap-1.5 border-b border-emerald-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Result
      </div>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {result.columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap border-b border-white/10 px-3 py-1.5 text-left font-semibold text-slate-300"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="odd:bg-white/[0.015]">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="whitespace-nowrap border-b border-white/5 px-3 py-1.5 font-mono text-slate-200 last:border-r-0"
                >
                  {cell === null ? (
                    <span className="italic text-slate-500">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
