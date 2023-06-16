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
        console.log(JSON.stringify({
          vite: options.vite,
          mode: options.target
        }, null, 2))
      }
    }
  }],
  output: "server",
  adapter: cloudflare()
});