// Content model for the Learn system (Java / LLD / HLD).
// Every lesson has a stable id -> progress is tracked in the same store as
// topics/problems under the key `l-<domain>-<lessonId>`.

export type Block =
  | { t: "p"; md: string } // paragraph; supports `inline code` and **bold**
  | { t: "ul"; items: string[] }
  | { t: "code"; lang: string; code: string; caption?: string }
  | { t: "note"; md: string } // amber callout — gotchas, interview tips
  | { t: "table"; head: string[]; rows: string[][] };

export type Lesson = {
  id: string; // unique within the domain, kebab-case
  title: string;
  summary?: string; // one-liner shown under the title
  blocks: Block[];
};

export type LearnSection = {
  id: string;
  title: string;
  desc?: string;
  lessons: Lesson[];
};

export type LearnDomain = {
  key: string; // route: /learn/<key>
  name: string;
  tagline: string;
  icon: string; // lucide icon name (resolved in Sidebar/LearnView)
  accent: string; // tailwind gradient classes for the header chip
  sections: LearnSection[];
};

export function lessonProgressId(domainKey: string, lessonId: string) {
  return `l-${domainKey}-${lessonId}`;
}

export function allLessons(d: LearnDomain): Lesson[] {
  return d.sections.flatMap((s) => s.lessons);
}
