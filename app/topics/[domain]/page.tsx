import { RESOURCE_DOMAINS } from "@/lib/learn";
import { DomainView } from "./DomainView";

export function generateStaticParams() {
  return RESOURCE_DOMAINS.map((d) => ({ domain: d.key }));
}

export default function TopicDomainPage({ params }: { params: { domain: string } }) {
  return <DomainView domainKey={params.domain} />;
}
