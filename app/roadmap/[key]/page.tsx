import { ROADMAPS } from "@/lib/roadmap";
import { RoadmapView } from "./RoadmapView";

export function generateStaticParams() {
  return ROADMAPS.map((r) => ({ key: r.key }));
}

export default function RoadmapTrackPage({ params }: { params: { key: string } }) {
  return <RoadmapView roadmapKey={params.key} />;
}
