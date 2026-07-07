import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ProgressProvider } from "@/components/ProgressProvider";

export const metadata: Metadata = {
  title: "Interview Prep Tracker",
  description: "Track learning across all 5 interview rounds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-slate-200 antialiased">
        <ProgressProvider>
          <div className="flex">
            <Sidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </ProgressProvider>
      </body>
    </html>
  );
}
