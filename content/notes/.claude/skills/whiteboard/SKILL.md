---
name: whiteboard
description: Run a live HLD/LLD design session in the Notebook. The user talks, you build the design step by step in content/notes/whiteboard/<topic>.md, and their open browser tab redraws by itself within a second. Use when the user says whiteboard, "design X live", "draw this", or wants to practise a system-design or low-level-design interview.
---

# Live whiteboard

The Notebook watches `content/notes/`. Every time you save a file, the user's open tab patches
itself: only the blocks you changed are replaced (they flash once), unchanged diagrams stay
drawn, and scroll position is kept. Notes under `whiteboard/` are **boards**: numbered steps,
wide diagrams, and "Follow" (auto-scroll to your edit) on by default.

There is no tool to call. **Editing the markdown file is the whole interface.**
For formatting rules (callouts, tables, colours, interview questions) follow the `notes` skill;
this skill adds the live-session protocol.

## Session protocol

1. **Create the board first.** Write `content/notes/whiteboard/<kebab-topic>.md` with the title,
   a one-line hook and an empty `## Requirements and numbers` section. Then tell the user
   the URL: `/notebook/whiteboard/<kebab-topic>` and ask them to keep that tab visible.
2. **One step per turn.** Add or revise a single `##` section, then say in one or two lines what
   you changed and what you want to decide next. Typical order for HLD:
   Requirements and numbers → API → Data model → High-level design → one section per deep
   dive → Failure modes and scaling → Trade-offs → Interview questions → Key takeaways.
   For LLD: Requirements → Entities (classDiagram) → Key flows (sequenceDiagram) →
   States (stateDiagram-v2) → Code skeleton → Extensions.
3. **Edit in place, do not rewrite the file.** Use small Edit replacements. A whole-file rewrite
   re-sends every block, so the page loses its "what just changed" signal. Never reorder
   unrelated sections.
4. **When the user pushes back, change the diagram, not just your reply.** Revise the existing
   section in place. If the decision matters, add a row under a `## Decisions` table at the
   bottom (*Decision* | *Why* | *Alternative rejected*).
5. **Do not commit or push.** The user syncs notes themselves.

## Rules that make a board work

- **No numbers in headings.** Board `##` headings are numbered automatically. Write
  `## High-level design`, not `## 3. High-level design`.
- **Mermaid only.** Use `flowchart TD`, `sequenceDiagram`, `erDiagram`, `classDiagram`,
  `stateDiagram-v2`. Never write Excalidraw JSON by hand.
- **One idea per diagram, one sentence after it** saying what to notice. Phone rules from the
  `notes` skill apply (at most 4 sequence participants, prefer `TD`).
- **Get the syntax right the first time.** A diagram that fails to parse keeps the *previous*
  drawing on screen with an amber error message, which confuses a live session. Quote labels
  that contain punctuation: `A["Cache (Redis)"]`. Use the semantic `classDef` colours from the
  `notes` skill.
- **Do the numbers.** A requirements table with a working column (`100M ÷ 2.6M s ≈ 40 writes/s`)
  is the most valuable part of an HLD board.
- **Write down trade-offs as a table** (*Decision* | *Option A* | *Option B* | *Pick*), not prose.

## Starter skeleton

````markdown
# Design a <thing>

<one-line hook: what makes this problem hard>

> [!TIP]
> - **Scale:** <the headline numbers>
> - **Design:** <the 3-part answer>
> - **Trade-off:** <the one decision that matters>

## Requirements and numbers

| Metric | Estimate | Working |
|---|---|---|

## API

## Data model

## High-level design
````

A finished example: [`whiteboard/url-shortener.md`](../../../whiteboard/url-shortener.md).
How the user sees it: [`whiteboard/how-it-works.md`](../../../whiteboard/how-it-works.md).