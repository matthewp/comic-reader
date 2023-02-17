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

load('#book1', n => `https://cdn.spooky.click/book-archive/Baffling Mysteries 009/Baffling Mysteries 09_${n}.jpg`);
load('#book2', n => `https://cdn.spooky.click/book-archive/Whiz 031/Whiz 031-${n}.jpg`);