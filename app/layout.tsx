import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
import { CommandPalette } from "@/components/CommandPalette";
import { NoteEditorHost } from "@/components/notebook/NoteEditorHost";
import { AutoSync } from "@/components/notebook/AutoSync";
import { RouteResume } from "@/components/RouteResume";

export const metadata: Metadata = {
  title: "Interview Prep Tracker",
  description: "Track learning across all interview rounds.",
};

// Runs before paint to set the theme attribute and avoid a light/dark flash.
const NO_FLASH = `(function(){try{var p=localStorage.getItem('theme.v1')||'system';var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="min-h-screen font-sans text-slate-200 antialiased">
        <ThemeProvider>
          <ProgressProvider>
            <Suspense fallback={null}>
              <RouteResume />
            </Suspense>
            <AppShell>{children}</AppShell>
            <CommandPalette />
            <NoteEditorHost />
            <AutoSync />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
