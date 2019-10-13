---
layout: page.njk
title: <comic-reader>
id: home
shortTitle: Home
tags: page
date: 2019-10-08
includeReader: true
preloadImage:
  - ../../comics-temp/Baffling Mysteries 009/Baffling Mysteries 09_01.jpg
  - ../../comics-temp/Whiz 031/Whiz 031-01.jpg
---

With a tiny bit of code you can easily embed comics on your site.

```html
<script type="module" src="https://unpkg.com/comic-reader@0.4.0/mod.js"></script>
<comic-reader src="https://example.com/whiz-comics-01.cbz"></comic-reader>
```

## Demos

<script type="module">
  function readerSrc(urls) {
    return {
      getLength() {
        return urls.length;
      },

      async item(index) {
        return urls[index];
      }
    };
  }

  function fill(n) {
    let s = n.toString();
    return s.length === 1 ? '0' + s : s;
  }

  function load(id, c) {
    document.querySelector(id).src = readerSrc(
      Array.from({ length: 36 }, (e, i) => c(fill(i + 1)))
    );
  }

  load('#book1', n => `../../comics-temp/Baffling Mysteries 009/Baffling Mysteries 09_${n}.jpg`);
  load('#book2', n => `../../comics-temp/Whiz 031/Whiz 031-${n}.jpg`)
</script>

<div class="demos">
  <comic-reader id="book1" title="Baffling Mysteries #9"></comic-reader>
  <comic-reader id="book2" title="Whiz Comics #31"></comic-reader>
</div>