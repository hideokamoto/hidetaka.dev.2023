import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import markdoc from "@astrojs/markdoc";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), markdoc({
    tags: {
      externalLink: {
        render: 'ExternalLink',
        attributes: {
          class: {
            type: String,
          },
          href: {
            type: String,
          },
          lebel: {
            type: String,
          }
        }
      },
    },
  }), tailwind(), react()]
});