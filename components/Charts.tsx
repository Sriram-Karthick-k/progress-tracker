"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell as BarCell,
} from "recharts";

type Slice = { name: string; value: number; color: string };

export function StatusDonut({
  data,
  centerLabel,
  centerSub,
}: {
  data: Slice[];
  centerLabel: string;
  centerSub: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="relative h-[180px] w-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={total ? data : [{ name: "none", value: 1, color: "#1e293b" }]}
            dataKey="value"
            innerRadius={62}
            outerRadius={84}
            startAngle={90}
            endAngle={-270}
            paddingAngle={total ? 2 : 0}
            stroke="none"
          >
            {(total ? data : [{ color: "#1e293b" }]).map((d, i) => (
              <Cell key={i} fill={(d as Slice).color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-3xl font-extrabold text-white">{centerLabel}</div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400">
            {centerSub}
          </div>
        </div>
      </div>
    </div>
  );
}

type HBar = { name: string; pct: number; label: string; color: string };

function HBarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as HBar;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 shadow-card">
      <div className="font-semibold">{p.name}</div>
      <div className="text-slate-400">
        {p.label} · {p.pct}%
      </div>
    </div>
  );
}

export function HorizontalBars({ data }: { data: HBar[] }) {
  const height = Math.max(120, data.length * 34 + 10);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        barCategoryGap={8}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={108}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(100,116,139,0.12)" }} content={<HBarTooltip />} />
        <Bar dataKey="pct" radius={[4, 4, 4, 4]} background={{ fill: "rgba(100,116,139,0.18)" }}>
          {data.map((d, i) => (
            <BarCell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
