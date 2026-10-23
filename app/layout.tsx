import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { ThemeProvider, THEME_NO_FLASH_SCRIPT } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
import { CommandPalette } from "@/components/CommandPalette";
import { NoteEditorHost } from "@/components/notebook/NoteEditorHost";
import { AutoSync } from "@/components/notebook/AutoSync";
import { RouteResume } from "@/components/RouteResume";

export const metadata: Metadata = {
  title: "Interview Prep Tracker",
  description: "Track learning across all interview rounds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH_SCRIPT }} />
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
