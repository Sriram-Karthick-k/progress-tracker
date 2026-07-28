"use client";

// The roadmap as an interactive flowchart (Labuladong / React-Flow style):
// a root node → an ordered spine of section boxes, each box grouping its topic
// chips in a grid (like the reference's "Basic Data Structure" containers).
// Every node/chip carries LIVE progress (status dot + mini bar); chips deep-link
// to the work. Auto-laid-out with dagre. Works for ANY track (DSA or a domain).

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import { Roadmap, stepProgressIds } from "@/lib/roadmap";
import { weightedPct, Status } from "@/lib/status";
import { useProgress } from "@/components/ProgressProvider";
import { useTheme } from "@/components/ThemeProvider";
import type { ProgressMap } from "@/lib/progress";

// mid-tone that reads on both light and dark backgrounds
const EDGE_STROKE = "rgb(100 116 139 / 0.6)";

// ---- layout geometry (shared by dagre + render so positions match the DOM) ----
const ROOT_W = 240;
const ROOT_H = 60;
const SECTION_W = 380;
const HEADER_H = 60;
const CHIP_H = 38;
const CHIP_GAP = 8;
const PAD_Y = 14;
const COLS = 2;

function sectionHeight(topicCount: number) {
  const rows = Math.max(1, Math.ceil(topicCount / COLS));
  return HEADER_H + rows * CHIP_H + (rows - 1) * CHIP_GAP + PAD_Y * 2;
}

type Prog = { pct: number; done: number; total: number };

function progOf(ids: string[], map: ProgressMap): Prog {
  const statuses = ids.map((id) => (map[id]?.status ?? "TODO") as Status);
  return {
    pct: weightedPct(statuses),
    done: statuses.filter((s) => s === "DONE").length,
    total: statuses.length,
  };
}

function dotColor(pct: number) {
  if (pct >= 100) return "bg-emerald-400";
  if (pct > 0) return "bg-amber-400";
  return "bg-rose-400/80";
}

function MiniBar({ pct }: { pct: number }) {
  const color = pct >= 100 ? "bg-emerald-400" : pct > 0 ? "bg-amber-400" : "bg-slate-700";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-950/80 ring-1 ring-inset ring-white/5">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---- node data + renderers ----
type TopicChip = { label: string; pct: number; done: number; total: number; href?: string; multi: boolean };
type RootData = { label: string; accent: string; pct: number };
type SectionData = { title: string; index: number; pct: number; done: number; total: number; topics: TopicChip[] };

function RootNode({ data }: NodeProps) {
  const d = data as unknown as RootData;
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br px-4 text-center text-[15px] font-bold text-onaccent shadow-card ${d.accent}`}
      style={{ width: ROOT_W, height: ROOT_H }}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-white/40" />
      {d.label}
    </div>
  );
}

function SectionNode({ data }: NodeProps) {
  const d = data as unknown as SectionData;
  const router = useRouter();
  return (
    <div
      className="rounded-2xl border border-white/15 bg-slate-900/90 p-3.5 shadow-card"
      style={{ width: SECTION_W }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/40" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/40" />
      {/* header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/10 text-xs font-bold text-slate-200">
          {d.index}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{d.title}</span>
        <span className="shrink-0 text-[11px] tabular-nums text-slate-400">{d.done}/{d.total}</span>
        <span className={`h-3 w-3 shrink-0 rounded-full ${dotColor(d.pct)}`} />
      </div>
      {/* topic chips */}
      <div className="grid grid-cols-2 gap-2" style={{ gridAutoRows: `${CHIP_H}px` }}>
        {d.topics.map((t) => (
          <button
            key={t.label}
            onClick={(e) => {
              e.stopPropagation();
              if (t.href) router.push(t.href);
            }}
            title={t.label}
            className={`nodrag flex flex-col justify-center rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1 text-left transition ${
              t.href ? "cursor-pointer hover:border-indigo-400/60 hover:bg-slate-800/70" : "cursor-default"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(t.pct)}`} />
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-100">{t.label}</span>
              <span className="shrink-0 text-[9px] tabular-nums text-slate-500">
                {t.multi ? `${t.done}/${t.total}` : `${t.pct}%`}
              </span>
            </div>
            <div className="mt-1">
              <MiniBar pct={t.pct} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = { root: RootNode, section: SectionNode };

// ---- structure + dagre layout (depends only on the roadmap shape) ----
function buildLayout(roadmap: Roadmap): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", ranksep: 56, nodesep: 40, marginx: 24, marginy: 24 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const edgeStyle = { stroke: EDGE_STROKE, strokeWidth: 1.5 };

  const rootId = `root:${roadmap.key}`;
  nodes.push({ id: rootId, type: "root", position: { x: 0, y: 0 }, data: {}, width: ROOT_W, height: ROOT_H });
  g.setNode(rootId, { width: ROOT_W, height: ROOT_H });

  let prevId = rootId;
  roadmap.steps.forEach((step) => {
    const secId = `sec:${step.id}`;
    const h = sectionHeight(step.items.length);
    nodes.push({ id: secId, type: "section", position: { x: 0, y: 0 }, data: {}, width: SECTION_W, height: h });
    g.setNode(secId, { width: SECTION_W, height: h });
    g.setEdge(prevId, secId);
    edges.push({ id: `e-${prevId}-${secId}`, source: prevId, target: secId, type: "smoothstep", style: edgeStyle });
    prevId = secId; // chain sections into an ordered spine
  });

  dagre.layout(g);
  nodes.forEach((n) => {
    const p = g.node(n.id);
    const w = (n.width as number) ?? SECTION_W;
    const h = (n.height as number) ?? ROOT_H;
    n.position = { x: p.x - w / 2, y: p.y - h / 2 };
  });

  return { nodes, edges };
}

export function RoadmapGraph({ roadmap }: { roadmap: Roadmap }) {
  const { map } = useProgress();
  const { resolved } = useTheme();
  const router = useRouter();

  const layout = useMemo(() => buildLayout(roadmap), [roadmap.key]);

  const nodes = useMemo<Node[]>(() => {
    const overall = progOf(roadmap.steps.flatMap(stepProgressIds), map);
    return layout.nodes.map((n) => {
      if (n.type === "root") {
        return { ...n, data: { label: roadmap.name, accent: roadmap.accent, pct: overall.pct } };
      }
      const idx = roadmap.steps.findIndex((s) => `sec:${s.id}` === n.id);
      const step = roadmap.steps[idx];
      const secProg = progOf(stepProgressIds(step), map);
      const topics: TopicChip[] = step.items.map((item) => {
        const p = progOf(item.progressIds, map);
        return { label: item.label, ...p, href: item.href, multi: item.progressIds.length > 1 };
      });
      return { ...n, data: { title: step.title, index: idx + 1, ...secProg, topics } };
    });
  }, [layout, map, roadmap]);

  // clicking a section's blank area (not a chip) is a no-op; chips handle their own nav
  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const href = (node.data as { href?: string })?.href;
      if (href) router.push(href);
    },
    [router]
  );

  return (
    <div className="h-full min-h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
      {/* key = full remount when switching roadmaps. fitView only auto-runs
          ONCE per ReactFlow instance (on mount) — without this key, navigating
          client-side between roadmaps (e.g. DSA -> Java) keeps the previous
          roadmap's pan/zoom, so the new graph renders at the wrong scale and
          its nodes look cramped/overlapping. */}
      <ReactFlow
        key={roadmap.key}
        nodes={nodes}
        edges={layout.edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        colorMode={resolved}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(100,116,139,0.25)" />
        <Controls showInteractive={false} className="!border-white/10 !bg-slate-900/80" />
      </ReactFlow>
    </div>
  );
}
