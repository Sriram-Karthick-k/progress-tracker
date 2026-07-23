import { Method } from "@/lib/cheatsheets";

// A real reference table for a cheat-sheet section: ONE ROW PER METHOD.
// Columns: the method/call · what it does (+ any gotcha) · a runnable example
// with its result. Scan the left column to find what you need.
export function CheatTable({ methods }: { methods: Method[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/40 shadow-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-white/[0.03]">
            <th className="w-[30%] border-b border-white/10 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
              Method
            </th>
            <th className="w-[38%] border-b border-white/10 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
              What it does
            </th>
            <th className="border-b border-white/10 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
              Example
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {methods.map((m, i) => (
            <tr key={i} className="align-top odd:bg-white/[0.015]">
              <td className="px-4 py-3">
                <code className="whitespace-pre-wrap break-words font-mono text-[12.5px] font-semibold text-indigo-300">
                  {m.name}
                </code>
              </td>
              <td className="px-4 py-3 text-[13px] leading-relaxed text-slate-300">
                {m.desc}
                {m.note && (
                  <div className="mt-2 flex gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-1.5 text-xs leading-relaxed text-amber-200/90">
                    <span className="shrink-0">⚠</span>
                    <span>{m.note}</span>
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {m.ex && (
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-[#0b1120] px-3 py-2 font-mono text-[12.5px] leading-relaxed text-[#e2e8f0]">
                    {m.ex}
                  </pre>
                )}
                {m.out && (
                  <div className="mt-1.5 flex items-start gap-1.5 font-mono text-[12.5px] text-emerald-300">
                    <span className="shrink-0 text-emerald-500">→</span>
                    <span className="whitespace-pre-wrap break-words">{m.out}</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
