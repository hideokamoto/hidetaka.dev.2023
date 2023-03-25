import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import markdoc from "@astrojs/markdoc";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap(), markdoc({
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
  }), tailwind()]
});