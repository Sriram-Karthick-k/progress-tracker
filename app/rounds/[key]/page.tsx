import { ROUNDS } from "@/lib/seed-data";
import { RoundView } from "./RoundView";

export function generateStaticParams() {
  return ROUNDS.map((r) => ({ key: r.key }));
}

export default function RoundPage({ params }: { params: { key: string } }) {
  return <RoundView roundKey={params.key} />;
}
