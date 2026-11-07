/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No SQLite, no Prisma. Progress lives in localStorage; notes live as markdown
  // files. The /api/notes route (writes note files) is enabled only in "local"
  // builds via NEXT_PUBLIC_NOTES_EDITABLE=1 — remote deploys are read-only.
  experimental: {
    // the notes file watcher (lib/noteWatcher.ts) must load from node_modules, not be bundled
    serverComponentsExternalPackages: ["chokidar"],
  },
  // The old Cheat Sheets page now lives in the Notebook (locked notes). Keep old links,
  // bookmarks and the saved "resume where you left off" route working.
  async redirects() {
    const tab = (value) => ({ source: "/cheatsheets", has: [{ type: "query", key: "tab", value }], destination: `/notebook/cheat-sheets/${value}`, permanent: false });
    return [
      tab("sql"),
      tab("cpp"),
      tab("javascript"),
      { source: "/cheatsheets", destination: "/notebook/cheat-sheets/java", permanent: false },
    ];
  },
};

export default nextConfig;