import { catalogRevision, ebookBranch, ebookRepository } from "./lib/ebook-source.js";

const githubRaw = `https://raw.githubusercontent.com/${ebookRepository}`;
const ebookPath = ":format(pdf|epup)/:file";

const nextConfig = {
  agentRules: false,
  trailingSlash: true,
  async rewrites() {
    return [
      { source: `/content/catalog/${catalogRevision}/${ebookPath}`, destination: `${githubRaw}/${catalogRevision}/ebook/:format/:file` },
      { source: `/content/uploads/${ebookPath}`, destination: `${githubRaw}/${ebookBranch}/ebook/:format/:file` },
    ];
  },
  async headers() {
    return [
      {
        source: "/content/:path*",
        headers: [
          { key: "x-vercel-enable-rewrite-caching", value: "1" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "default-src 'none'; sandbox" },
        ],
      },
      {
        source: `/content/catalog/${catalogRevision}/${ebookPath}`,
        missing: [{ type: "header", key: "range" }],
        headers: [
          { key: "CDN-Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/content/:path*",
        has: [{ type: "header", key: "range" }],
        headers: [{ key: "x-vercel-enable-rewrite-caching", value: "0" }],
      },
    ];
  },
};

export default nextConfig;
