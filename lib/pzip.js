import zip from './zipjs/zip.js';

let pth = new URL('./zipjs/', import.meta.url).toString();
zip.workerScriptsPath = pth;

function getEntries(blob) {
  let blobReader = new zip.BlobReader(blob);
  return new Promise((resolve, reject) => {
    zip.createReader(blobReader, zipReader => {
      zipReader.getEntries(resolve);
    }, reject);
  })
}

function getBlobURL(entry, onprogress) {
  let writer = new zip.BlobWriter();

  function calculateProgress(bytes) {
    let perc = bytes / entry.compressedSize;
    onprogress(perc);
  }

  return new Promise(resolve => {
    entry.getData(writer, blob => {
      let url = URL.createObjectURL(blob);
      resolve(url);
    }, calculateProgress);
  });
}

class ZipBook {
  constructor(src) {
    this.src = src;
    this.entries = null;
    this.currentPageNumber = 0;
    this.currentPageURL = null;
    this.urls = [];
    this.preload = this.preload.bind(this);
  }

  getEntry(i) {
    return this.entries[i];
  }

  async load() {
    this.entries = await getEntries(this.src);
  }

  async loadPage(i, onprogress = Function.prototype) {
    let entry = this.getEntry(i);

    let url = await getBlobURL(entry, prog => {
      let perc = Math.ceil(prog * 100);
      onprogress(perc);
    });

    this.urls[i] = url;
    return url;
  }

  async peek(i) {
    if(this.urls[i]) {
      return this.urls[i];
    }

    return this.loadPage(i);
  }

  async goto(i, onprogress) {
    if(this.urls[i]) {
      return this.urls[i];
    }

    this.currentPageURL = this.loadPage(i, onprogress);
    return this.currentPageURL;
  }

  async nextPage(onprogress) {
    if(!this.canAdvance()) {
      return this.currentPageURL;
    }

    this.currentPageNumber = this.currentPageNumber + 1;
    return this.goto(this.currentPageNumber, onprogress);
  }

  async previousPage(onprogress) {
    if(this.currentPageNumber === 0) {
      return this.currentPageURL;
    }

    this.currentPageNumber = this.nextPageNumber();
    return this.goto(this.currentPageNumber, onprogress);
  }

  nextPageNumber() {
    return this.currentPageNumber + 1;
  }

  canAdvance() {
    return this.nextPageNumber() <= this.entries.length;
  }

  preloadIdle() {
    requestIdleCallback(this.preload);
  }

  async preload() {
    if(this.entries.length > this.urls.length) {
      await this.loadPage(this.urls.length);
      requestIdleCallback(this.preload);
    }
  }

  close() {
    while(this.urls.length) {
      let url = this.urls.shift();
      URL.revokeObjectURL(url);
    }
    this.currentPageNumber = 0;
  }
}

export {
  ZipBook,
  ZipBook as default,
  getEntries,
  getBlobURL
};