---
layout: page.njk
title: <comic-reader>
id: home
shortTitle: Home
tags: page
date: 2019-10-08
includeReader: true
preloadFetch:
  - ./images/baffling-mysteries-09.cbz
  - ./images/whiz-comics-31.cbz
---

With a tiny bit of code you can easily embed comics on your site.

```html
<script type="module" src="https://unpkg.com/comic-reader@0.4.0/mod.js"></script>
<comic-reader src="https://example.com/whiz-comics-01.cbz"></comic-reader>
```

## Demos

<div class="demos">
  <comic-reader title="Baffling Mysteries #9" src="./images/baffling-mysteries-09.cbz"></comic-reader>
  <comic-reader title="Whiz Comics #31" src="./images/whiz-comics-31.cbz"></comic-reader>
</div>