import { ResourceDomain } from "../resource-types";

// REACT — comprehensive curated FREE resources. react.dev is the primary source.
export const REACT: ResourceDomain = {
  key: "react",
  name: "React",
  tagline: "Components, props, state, effects, hooks, performance, and the ecosystem — from the official docs.",
  icon: "Atom",
  accent: "from-sky-400 to-cyan-500",
  sections: [
    {
      id: "start",
      title: "Start here",
      topics: [
        {
          id: "official",
          title: "The official docs & courses",
          blurb: "react.dev is the modern, interactive, hooks-first tutorial — the best React resource.",
          resources: [
            { kind: "docs", label: "Learn React (official, interactive)", by: "react.dev", url: "https://react.dev/learn" },
            { kind: "docs", label: "React reference (hooks & APIs)", by: "react.dev", url: "https://react.dev/reference/react" },
            { kind: "docs", label: "Thinking in React", by: "react.dev", url: "https://react.dev/learn/thinking-in-react" },
            { kind: "course", label: "React courses & articles", by: "freeCodeCamp", url: "https://www.freecodecamp.org/news/tag/react/" },
          ],
        },
      ],
    },
    {
      id: "fundamentals",
      title: "Fundamentals",
      topics: [
        {
          id: "describing-ui",
          title: "Components, JSX & props",
          blurb: "Describing the UI: components, JSX, props, keeping components pure.",
          resources: [
            { kind: "docs", label: "Describing the UI", by: "react.dev", url: "https://react.dev/learn/describing-the-ui" },
            { kind: "docs", label: "Keeping components pure", by: "react.dev", url: "https://react.dev/learn/keeping-components-pure" },
          ],
        },
        {
          id: "lists-keys",
          title: "Conditional & list rendering (keys)",
          blurb: "Rendering lists, why stable keys matter (the index-as-key bug).",
          resources: [
            { kind: "docs", label: "Rendering lists", by: "react.dev", url: "https://react.dev/learn/rendering-lists" },
            { kind: "docs", label: "Conditional rendering", by: "react.dev", url: "https://react.dev/learn/conditional-rendering" },
          ],
        },
      ],
    },
    {
      id: "state",
      title: "State & interactivity",
      topics: [
        {
          id: "state-events",
          title: "State, events & the render cycle",
          blurb: "useState, event handling, how re-rendering works, batching.",
          resources: [
            { kind: "docs", label: "Adding interactivity", by: "react.dev", url: "https://react.dev/learn/adding-interactivity" },
            { kind: "docs", label: "State: a component's memory", by: "react.dev", url: "https://react.dev/learn/state-a-components-memory" },
            { kind: "docs", label: "Render and commit", by: "react.dev", url: "https://react.dev/learn/render-and-commit" },
          ],
        },
        {
          id: "managing-state",
          title: "Structuring & sharing state",
          blurb: "Choosing state shape, lifting state up, derived vs stored state, context + reducer.",
          resources: [
            { kind: "docs", label: "Managing state", by: "react.dev", url: "https://react.dev/learn/managing-state" },
            { kind: "docs", label: "Sharing state between components", by: "react.dev", url: "https://react.dev/learn/sharing-state-between-components" },
            { kind: "docs", label: "Scaling up with reducer + context", by: "react.dev", url: "https://react.dev/learn/scaling-up-with-reducer-and-context" },
          ],
        },
        {
          id: "forms",
          title: "Forms & controlled inputs",
          blurb: "Controlled vs uncontrolled; reacting to input with state.",
          resources: [
            { kind: "docs", label: "Reacting to input with state", by: "react.dev", url: "https://react.dev/learn/reacting-to-input-with-state" },
          ],
        },
      ],
    },
    {
      id: "hooks",
      title: "Hooks & escape hatches",
      topics: [
        {
          id: "effects",
          title: "Effects — useEffect done right",
          blurb: "The mental model, cleanup, dependencies, and when you DON'T need an Effect.",
          resources: [
            { kind: "docs", label: "Synchronizing with Effects", by: "react.dev", url: "https://react.dev/learn/synchronizing-with-effects" },
            { kind: "docs", label: "You Might Not Need an Effect", by: "react.dev", url: "https://react.dev/learn/you-might-not-need-an-effect" },
            { kind: "docs", label: "Lifecycle of reactive effects", by: "react.dev", url: "https://react.dev/learn/lifecycle-of-reactive-effects" },
          ],
        },
        {
          id: "refs-custom",
          title: "Refs, memoization & custom hooks",
          blurb: "useRef, DOM refs, useMemo/useCallback, extracting custom hooks.",
          resources: [
            { kind: "docs", label: "Referencing values with refs", by: "react.dev", url: "https://react.dev/learn/referencing-values-with-refs" },
            { kind: "docs", label: "Reusing logic with custom hooks", by: "react.dev", url: "https://react.dev/learn/reusing-logic-with-custom-hooks" },
            { kind: "docs", label: "useMemo reference", by: "react.dev", url: "https://react.dev/reference/react/useMemo" },
          ],
        },
      ],
    },
    {
      id: "perf-ecosystem",
      title: "Performance & ecosystem",
      topics: [
        {
          id: "performance",
          title: "Rendering performance",
          blurb: "Reconciliation & keys, preserving/resetting state, React.memo, lazy/Suspense.",
          resources: [
            { kind: "docs", label: "Preserving and resetting state", by: "react.dev", url: "https://react.dev/learn/preserving-and-resetting-state" },
            { kind: "docs", label: "memo reference", by: "react.dev", url: "https://react.dev/reference/react/memo" },
          ],
        },
        {
          id: "typescript-testing",
          title: "TypeScript & testing",
          blurb: "Typing props/hooks/events; testing behavior with Testing Library.",
          resources: [
            { kind: "docs", label: "Using TypeScript", by: "react.dev", url: "https://react.dev/learn/typescript" },
            { kind: "docs", label: "React Testing Library", by: "Testing Library", url: "https://testing-library.com/docs/react-testing-library/intro/" },
          ],
        },
        {
          id: "data-routing",
          title: "Data fetching, routing & state libraries",
          blurb: "TanStack Query, React Router, when Redux/Zustand vs context.",
          resources: [
            { kind: "docs", label: "TanStack Query (data fetching/caching)", by: "TanStack", url: "https://tanstack.com/query/latest/docs/framework/react/overview" },
            { kind: "docs", label: "React Router", by: "React Router", url: "https://reactrouter.com/home" },
            { kind: "docs", label: "Redux Toolkit", by: "Redux", url: "https://redux-toolkit.js.org/" },
          ],
        },
      ],
    },
  ],
};
