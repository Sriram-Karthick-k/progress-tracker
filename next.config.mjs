/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No SQLite, no Prisma. Progress lives in localStorage; notes live as markdown
  // files. The /api/notes route (writes note files) is enabled only in "local"
  // builds via NEXT_PUBLIC_NOTES_EDITABLE=1 — remote deploys are read-only.
};

export default nextConfig;
