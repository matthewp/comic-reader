import { Archive } from 'libarchive.js';

let url = new URL('libarchive.js/dist/worker-bundle.js', import.meta.url).toString();

Archive.init({
  workerUrl: url
});

class ZipSource {
  constructor(blob) {
    this.blob = blob;
    this.entries = [];
    this.urls = [];
    this.loadPromise = this._load();
    this.handleProgress = Function.prototype;
    this.itemsLoaded = 0;
    this._onFile = this._onFile.bind(this);
  }

  async _load() {
    this.archive = await Archive.open(this.blob);
    this.raw = await this.archive.getFilesArray();
    this.numberOfFiles = this.raw.length;
    await this.archive.extractFiles(this._onFile);

    let files = await this.archive.getFilesArray();
    files.sort((a, b) => {
      if(a.file.name < b.file.name)
        return -1;
      else
        return 1;
    });

    for(let file of files) {
      let url = URL.createObjectURL(file.file);
      this.urls.push(url);
    }
  }
  
  _onFile() {
    this.itemsLoaded++;
    let frac = this.itemsLoaded / this.numberOfFiles;
    let perc = Math.floor(frac * 100);
    this.handleProgress(perc);
  }

  getLength() {
    return this.raw.length;
  }

  async item(index, onprogress) {
    if(this.urls[index]) {
      return this.urls[index];
    }
    this.handleProgress = onprogress;
    await this.loadPromise;
    return this.urls[index];
  }
}

export default ZipSource;