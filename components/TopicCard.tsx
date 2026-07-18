import { StatusToggle } from "./StatusToggle";
import { ConfidenceStars } from "./ConfidenceStars";
import { RevisitFlag } from "./RevisitFlag";
import { TopicDef } from "@/lib/seed-data";

export function TopicCard({ topic }: { topic: TopicDef }) {
  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1 border-b border-white/5 px-5 py-3.5 transition last:border-b-0 hover:bg-white/[0.02]">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-100">{topic.name}</div>
        {topic.description && (
          <div className="mt-0.5 text-sm text-slate-400">{topic.description}</div>
        )}
      </div>
      <ConfidenceStars id={topic.id} />
      <StatusToggle id={topic.id} />
      <RevisitFlag id={topic.id} />
    </div>
  );
}
