import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  // Enable source maps for production builds (required for Sentry error debugging)
  productionBrowserSourceMaps: true,

  async redirects() {
    return [
      // Agent Skills discovery: the .well-known suffix is not yet standardized.
      // Serve the canonical manifest + SKILL.md under /.well-known/skills/ (the
      // path the skills CLI uses today) and redirect the newer
      // /.well-known/agent-skills/ path to it, so a single source of truth
      // covers both.
      //
      // Next.js doesn't serve index.json for a bare directory request, so map
      // the directory roots to the manifest for tools that probe the root.
      // These exact matches must precede the wildcard below.
      {
        source: '/.well-known/skills',
        destination: '/.well-known/skills/index.json',
        permanent: false,
      },
      {
        source: '/.well-known/agent-skills',
        destination: '/.well-known/skills/index.json',
        permanent: false,
      },
      // Wildcard so nested files (index.json, SKILL.md, ...) resolve after the
      // redirect from the agent-skills path.
      {
        source: '/.well-known/agent-skills/:path*',
        destination: '/.well-known/skills/:path*',
        permanent: false,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            // Chrome Translator API を使用するために必要
            // Chrome 131以降で利用可能（実験的機能）
            value: 'translator=(self)',
          },
        ],
      },
    ]
  },
}

export default nextConfig
