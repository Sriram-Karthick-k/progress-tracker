import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getNav } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Interview Prep Tracker",
  description: "Track learning across all 5 interview rounds.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { roundItems, lcPct } = await getNav();

  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-slate-200 antialiased">
        <div className="flex">
          <Sidebar roundItems={roundItems} lcPct={lcPct} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
