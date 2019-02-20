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

function getBlobURL(entry, onprogress = Function.prototype) {
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

class ZipSource {
  constructor(blob) {
    this.blob = blob;
    this.entries = [];
    this.urls = [];
    this.loadPromise = this._load();
  }

  async _load() {
    let entries = await getEntries(this.blob);
    this.entries = entries.filter(entry => !entry.directory);
  }

  getLength() {
    return this.entries.length;
  }

  async item(i, onprogress) {
    if(this.urls[i]) {
      return this.urls[i];
    }
    await this.loadPromise;
    let val = this.urls[i] = await getBlobURL(this.entries[i], onprogress);
    return val;
  }
}

export default ZipSource;