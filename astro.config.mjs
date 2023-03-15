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
    nodes: {
      heading: {
        render: 'Heading',
        attributes: {
          level: {
            type: String
          }
        }
      }
    }
  }), tailwind(), react()]
});