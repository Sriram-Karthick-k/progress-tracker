"use client";

// Class-hierarchy tree for the Cheat Sheets "Class Tree" tab. Reuses the same
// React-Flow + dagre engine as the roadmap graph, but lays out a real
// inheritance DAG (a child can have multiple parents, e.g. LinkedList is both
// a List and a Deque). Solid edges = extends, dashed = implements. Clicking a
// node opens that type's method table (via the onOpen callback).

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import {
  HIERARCHIES,
  hierarchyByKey,
  KIND_STYLE,
  type Hierarchy,
  type ClassNode as HClassNode,
} from "@/lib/hierarchy";
import { useTheme } from "@/components/ThemeProvider";

const EDGE_STROKE = "rgb(129 140 248 / 0.7)"; // indigo-400-ish, reads on both themes
const NODE_W = 210;
const NODE_H = 74;

type NodeData = HClassNode & { onOpen?: (tab: string, section: string) => void };

function ClassBox({ data }: NodeProps) {
  const d = data as unknown as NodeData;
  const style = KIND_STYLE[d.kind];
  const clickable = !!d.link;
  return (
    <div
      onClick={() => d.link && d.onOpen?.(d.link.tab, d.link.section)}
      title={clickable ? "Open its methods" : undefined}
      className={`flex flex-col justify-center rounded-xl border px-3 py-2 shadow-card transition ${style.box} ${
        clickable ? "cursor-pointer hover:brightness-125" : "cursor-default"
      }`}
      style={{ width: NODE_W, height: NODE_H }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/40" />
      <Handle type="source" position={Position.Bottom} className="!bg-white/40" />
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-bold text-white">{d.name}</span>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <div className="mt-1 line-clamp-2 text-[11px] leading-tight text-slate-300">{d.note}</div>
    </div>
  );
}

const nodeTypes = { cls: ClassBox };

function buildLayout(h: Hierarchy): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", ranksep: 60, nodesep: 28, marginx: 24, marginy: 24 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Node[] = h.nodes.map((n) => {
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
    return { id: n.id, type: "cls", position: { x: 0, y: 0 }, data: {}, width: NODE_W, height: NODE_H };
  });

  const edges: Edge[] = h.edges.map((e) => {
    g.setEdge(e.parent, e.child);
    const dashed = e.rel === "implements";
    return {
      id: `${e.parent}->${e.child}`,
      source: e.parent,
      target: e.child,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STROKE, width: 16, height: 16 },
      style: { stroke: EDGE_STROKE, strokeWidth: 1.5, strokeDasharray: dashed ? "6 4" : undefined },
    };
  });

  dagre.layout(g);
  nodes.forEach((n) => {
    const p = g.node(n.id);
    n.position = { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 };
  });

  return { nodes, edges };
}

export function ClassHierarchy({ onOpen }: { onOpen?: (tab: string, section: string) => void }) {
  const [key, setKey] = useState(HIERARCHIES[0].key);
  const { resolved } = useTheme();
  const h = hierarchyByKey(key)!;

  const layout = useMemo(() => buildLayout(h), [key]);

  const nodes = useMemo<Node[]>(
    () =>
      layout.nodes.map((n) => {
        const src = h.nodes.find((x) => x.id === n.id)!;
        return { ...n, data: { ...src, onOpen } };
      }),
    [layout, h, onOpen]
  );

  const legendEdges: { label: string; dashed: boolean }[] = [];
  if (h.rels.includes("extends")) legendEdges.push({ label: "extends", dashed: false });
  if (h.rels.includes("implements")) legendEdges.push({ label: "implements", dashed: true });
  if (h.rels.includes("groups")) legendEdges.push({ label: "belongs to", dashed: false });

  // only show kind swatches that appear in this hierarchy
  const kinds = Array.from(new Set(h.nodes.map((n) => n.kind)));

  return (
    <div>
      {/* toggle + legend */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex gap-2">
          {HIERARCHIES.map((x) => (
            <button
              key={x.key}
              onClick={() => setKey(x.key)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                x.key === key
                  ? "border-indigo-400/60 bg-indigo-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
          {kinds.map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded border ${KIND_STYLE[k].box}`} />
              {KIND_STYLE[k].label}
            </span>
          ))}
          <span className="mx-1 h-3 w-px bg-white/10" />
          {legendEdges.map((e) => (
            <span key={e.label} className="flex items-center gap-1.5">
              <svg width="22" height="8">
                <line
                  x1="0"
                  y1="4"
                  x2="22"
                  y2="4"
                  stroke={EDGE_STROKE}
                  strokeWidth="1.6"
                  strokeDasharray={e.dashed ? "5 3" : undefined}
                />
              </svg>
              {e.label}
            </span>
          ))}
        </div>
      </div>

      <p className="mb-3 text-[13px] leading-relaxed text-slate-400">{h.intro}</p>

      <div className="h-[74vh] min-h-[560px] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
        <ReactFlow
          nodes={nodes}
          edges={layout.edges}
          nodeTypes={nodeTypes}
          colorMode={resolved}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.8}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(100,116,139,0.25)" />
          <Controls showInteractive={false} className="!border-white/10 !bg-slate-900/80" />
        </ReactFlow>
      </div>
    </div>
  );
}
