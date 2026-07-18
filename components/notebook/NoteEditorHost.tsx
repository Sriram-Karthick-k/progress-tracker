"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FullscreenEditor } from "@/components/notebook/FullscreenEditor";
import { readNote, humanize } from "@/components/notebook/noteClient";

type EditorState = { slug: string[]; content: string; exists: boolean };

// Mounted once globally. Any "Note" button anywhere fires `open-note-editor`;
// this loads the file (or a fresh stub) and shows the full-screen editor.
export function NoteEditorHost() {
  const [state, setState] = useState<EditorState | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function onOpen(e: Event) {
      const { slug, title } = (e as CustomEvent).detail as { slug: string[]; title?: string };
      const { exists, content } = await readNote(slug).catch(() => ({ exists: false, content: "" }));
      setState({
        slug,
        exists,
        content: exists ? content : `# ${title || humanize(slug[slug.length - 1])}\n\n`,
      });
    }
    window.addEventListener("open-note-editor", onOpen as EventListener);
    return () => window.removeEventListener("open-note-editor", onOpen as EventListener);
  }, []);

  if (!state) return null;

  return (
    <FullscreenEditor
      slug={state.slug}
      initialContent={state.content}
      exists={state.exists}
      onClose={() => {
        setState(null);
        router.refresh(); // re-render server components so any shown note/tree updates
      }}
    />
  );
}
