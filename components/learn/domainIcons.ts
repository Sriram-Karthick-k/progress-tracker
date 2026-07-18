import {
  Coffee,
  Component,
  Network,
  Zap,
  Cpu,
  GraduationCap,
  Leaf,
  Atom,
  Circle,
  ListChecks,
  GitBranch,
  Boxes,
  type LucideIcon,
} from "lucide-react";

// Icons referenced by ResourceDomain.icon (and Roadmap.icon).
export const DOMAIN_ICONS: Record<string, LucideIcon> = {
  Coffee, // Java
  Component, // LLD
  Network, // HLD
  Zap, // Concurrency
  Cpu, // Low-level
  GraduationCap, // CS Fundamentals
  Leaf, // Spring
  Atom, // React
  ListChecks, // DSA
  GitBranch, // roadmaps
  Boxes, // Data Structures & Algorithms
};

export function domainIcon(name: string): LucideIcon {
  return DOMAIN_ICONS[name] ?? Circle;
}
