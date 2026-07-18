// Content model for the RESOURCE HUB (pivot 2026-07-17).
// The app organizes topics and points to the best FREE external resources
// (articles, videos, books, docs) — it is not the textbook. Progress is tracked
// per topic in the shared store under `r-<domain>-<topicId>`.

export type ResourceKind = "article" | "video" | "book" | "docs" | "practice" | "course";

export type Resource = {
  kind: ResourceKind;
  label: string; // what it is, e.g. "Baeldung: Java Streams"
  url: string; // must be a real, stable, freely-accessible URL
  by?: string; // author / site, shown as a small tag
};

export type ResourceTopic = {
  id: string; // stable, kebab-case; progress id = r-<domain>-<id>
  title: string;
  blurb?: string; // one-line "what this covers / why"
  resources: Resource[];
};

export type ResourceSection = {
  id: string;
  title: string;
  desc?: string;
  topics: ResourceTopic[];
};

export type ResourceDomain = {
  key: string; // route: /topics/<key>
  name: string;
  tagline: string;
  icon: string; // lucide icon name (resolved in domainIcons)
  accent: string; // tailwind gradient for the header chip
  sections: ResourceSection[];
};

export function topicProgressId(domainKey: string, topicId: string) {
  return `r-${domainKey}-${topicId}`;
}

export function allTopics(d: ResourceDomain): ResourceTopic[] {
  return d.sections.flatMap((s) => s.topics);
}
