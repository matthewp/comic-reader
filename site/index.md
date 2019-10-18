---
layout: page.njk
title: <comic-reader>
id: home
shortTitle: Home
tags: page
date: 2019-10-08
includeReader: true
preloadImage:
  - https://clue.world/book-archive/Baffling Mysteries 009/Baffling Mysteries 09_01.jpg
  - https://clue.world/book-archive/Whiz 031/Whiz 031-01.jpg
scripts:
  - scripts/demo-books.js
---

With a tiny bit of code you can easily embed comics on your site.

```html
<script type="module" src="https://unpkg.com/comic-reader@0.6.0/mod.js"></script>
<comic-reader src="https://example.com/whiz-comics-01.cbz"></comic-reader>
```

## Features

<article class="feature">
<div class="description">

### Fast, efficient comic reader

&lt;comic-reader&gt; efficiently recycles DOM nodes to ensure that transitioning between pages remains at 60fps.

</div>
<comic-reader id="book1" title="Baffling Mysteries #9"></comic-reader>
</article>

<article class="feature">
<div class="description">

### Another

and some text

</div>
<comic-reader id="book2" title="Whiz Comics #31" controls></comic-reader>
</article>

## More

* Support for __Zip__ (cbz) and __RAR__ (cbr) archives.
* Load from custom sources like databases or HTTP.
* Full-screen mode.
* Page browser that allows jumping ahead within a book.
* Customizable areas such as the title bar.
* Many stylable elements and animations.