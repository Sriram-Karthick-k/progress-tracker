import { StatusToggle } from "./StatusToggle";
import { ConfidenceStars } from "./ConfidenceStars";
import { RevisitFlag } from "./RevisitFlag";
import { NotesBox } from "./NotesBox";
import { Status } from "@/lib/status";

export type TopicLike = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  confidence: number;
  revisit: boolean;
  notes: string | null;
};

export function TopicCard({ topic }: { topic: TopicLike }) {
  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1 border-b border-white/5 px-5 py-3.5 transition last:border-b-0 hover:bg-white/[0.02]">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-100">{topic.name}</div>
        {topic.description && (
          <div className="mt-0.5 text-sm text-slate-400">{topic.description}</div>
        )}
      </div>
      <ConfidenceStars kind="topic" id={topic.id} confidence={topic.confidence} />
      <StatusToggle kind="topic" id={topic.id} status={topic.status as Status} />
      <RevisitFlag kind="topic" id={topic.id} revisit={topic.revisit} />
      <NotesBox kind="topic" id={topic.id} notes={topic.notes} />
    </div>
  );
}
