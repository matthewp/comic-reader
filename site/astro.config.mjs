import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/comic-reader/',
  site: 'https://pkg.spooky.click/comic-reader/',
  trailingSlash: 'always',
  markdown: {
    syntaxHighlight: 'prism'
  }
});