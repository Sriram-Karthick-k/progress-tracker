// Registry of all resource-hub domains. Add a domain here and it appears in the
// sidebar, /topics overview, and the dashboard.
import { ResourceDomain, allTopics, topicProgressId } from "../resource-types";
import { DS_ALGO } from "./ds-algo";
import { JAVA } from "./java";
import { SPRING } from "./spring";
import { REACT } from "./react";
import { LLD } from "./lld";
import { HLD } from "./hld";
import { CS_BASICS } from "./cs-basics";

export const RESOURCE_DOMAINS: ResourceDomain[] = [DS_ALGO, JAVA, SPRING, REACT, LLD, HLD, CS_BASICS];

/** The DS&A domain belongs under DSA in nav, not the general Topics list. */
export const DS_ALGO_KEY = "ds-algo";
export const TOPIC_DOMAINS: ResourceDomain[] = RESOURCE_DOMAINS.filter((d) => d.key !== DS_ALGO_KEY);

export function resourceDomainByKey(key: string): ResourceDomain | undefined {
  return RESOURCE_DOMAINS.find((d) => d.key === key);
}

/** Progress ids for every topic in a domain (for % aggregation). */
export function domainTopicIds(d: ResourceDomain): string[] {
  return allTopics(d).map((t) => topicProgressId(d.key, t.id));
}

export { allTopics, topicProgressId } from "../resource-types";
export type { ResourceDomain, ResourceSection, ResourceTopic, Resource } from "../resource-types";
