import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
