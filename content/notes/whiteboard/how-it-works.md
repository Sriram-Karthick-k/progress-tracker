# How the Whiteboard Works

Talk to an AI about a design while it edits one markdown file. The page in your browser redraws itself within a second, with no refresh and no lost place.

> [!TIP]
> - **Notes in `whiteboard/` are boards.** Steps are numbered, diagrams use the full width, and **Follow** is on by default.
> - The AI just **edits the file**. No plugin, MCP server or SDK is involved. A file watcher streams every save to your open tab.
> - Only the **blocks that changed** are replaced, so unchanged diagrams stay drawn and open quiz cards stay open.
> - **Diagrams update live too:** Mermaid diagrams, hand-drawn sketches, and several diagrams on one canvas. In full screen your zoom and pan are kept.

## The loop

```mermaid
flowchart TD
    U([You talk]):::you --> L[AI edits the note file]:::app
    L --> W[File watcher on the server]:::db
    W -->|"event, under 1 s"| B[Your open browser tab]:::good
    B -->|"changed blocks flash"| U
    classDef you  fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef app  fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    classDef db   fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    classDef good fill:#dcfce7,stroke:#16a34a,color:#14532d
```

The tab is a passive screen: you steer by talking, and the file is the only thing that moves.

## What the AI can draw

| It writes... | You see... |
|---|---|
| a ` ```mermaid ` fence | A crisp diagram in the site's theme |
| an ` ```excalidraw ` fence with Mermaid inside | The same diagram as a hand-drawn sketch |
| an ` ```excalidraw ` fence with nested parts | Several diagrams (Mermaid, plain shapes, exported drawings) on one canvas, with arrows between them |

The nested form suits a design with several pictures that belong together, such as the write path, the read path and the data model. The syntax, with a live example, is in [Several diagrams on one canvas](/notebook/notebook-features#several-diagrams-on-one-canvas).

## Start a session

1. Open the board you want in the Notebook (or ask the AI to create one under `whiteboard/`).
2. Tell the AI what to design, for example *"whiteboard: design a rate limiter, step by step"*.
3. Keep the tab visible next to your chat. Each reply adds or revises one step.

## What you see while it edits

| The AI... | The page... |
|---|---|
| rewords a paragraph | flashes that block once; your scroll position does not move |
| appends a new step | scrolls to it when **Follow** is on |
| writes a diagram or sketch with a syntax error | keeps the last good drawing and shows an amber message with the parse error |
| edits one part of a multi-diagram sketch | redraws only that part; the other diagrams on the canvas are left alone |
| edits a diagram you have open full screen | the full-screen view switches to the new drawing and keeps your zoom and pan |
| edits the note you have open in the editor | the editor follows the file if you have no unsaved changes, otherwise it asks |
| changes a note while the tab is in the background | refreshes once when you come back |
| is unreachable (server stopped) | shows *Reconnecting…* and catches up when it returns |

> [!NOTE]
> The board is one-way: the AI draws, you read, pan and zoom. Dragging shapes on screen is not saved back to the file.

**Related:** [Several diagrams on one canvas](/notebook/notebook-features#several-diagrams-on-one-canvas) has the drawing syntax, and [Design a train ticket booking system](/notebook/whiteboard/train-ticket-booking) is a finished board to look at.