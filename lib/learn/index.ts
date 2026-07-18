// The Learn system is now a curated RESOURCE HUB (pivot 2026-07-17).
// Re-export the resource registry so consumers import from "@/lib/learn".
export {
  RESOURCE_DOMAINS,
  TOPIC_DOMAINS,
  DS_ALGO_KEY,
  resourceDomainByKey,
  domainTopicIds,
  allTopics,
  topicProgressId,
} from "./resources";
export type { ResourceDomain, ResourceSection, ResourceTopic, Resource } from "./resources";
