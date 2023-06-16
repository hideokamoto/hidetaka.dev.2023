import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://hidetaka.dev',
  integrations: [sitemap(), tailwind(), {
    name: 'ssr-debug',
    hooks: {
      'astro:build:setup': (options) => {
        console.log(options)
        console.log(JSON.stringify(options.vite, null, 2))
      }
    }
  }],
  output: "server",
  adapter: cloudflare()
});