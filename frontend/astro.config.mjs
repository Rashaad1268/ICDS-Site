import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from "@tailwindcss/vite";
import { astroImageTools } from "astro-imagetools";
import prefetch from "@astrojs/prefetch";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), prefetch({
    intentSelector: 'a[href]'
  }), astroImageTools, svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});