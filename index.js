import { ZipBook } from './lib/pzip.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
    }

    #root {
      height: 100%;
      position: relative;
    }

    .progress-container {
      display: none;
    }

    .progress-container.open {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    progress {
      -webkit-appearance: none;
    }

    progress::-moz-progress-bar {
      background: dodgerblue;
    }
    ::-webkit-progress-bar {
      background-color: dodgerblue;
    }
    progress::-webkit-progress-value {
      background: midnightblue;
    }

    #root:focus {
      outline: none;
    }

    img {
      /* Not important now but eventually figure this out. */
      /*transition: width 3s ease-in-out;*/
    }

    .fit-height {
      height: fit-content;
      display: flex;
      justify-content: center;
    }

    .fit-height img {
      max-height: 100%;
      height: 100%;
      overflow: scroll;
    }

    .fit-width {
      height: 100%;
      overflow: scroll;
    }

    .fit-width img {
      width: 100%;
    }
  </style>
  <div id="root" tabindex="0">
    <div class="controls">
      <button id="fit-width">Fit width</button>
      <button id="fit-height">Fit height</button>
      <button id="fullscreen">Fullscreen</button>
    </div>
    <div class="progress-container">
      <progress value="0" max="100"></progress>
    </div>
    <div id="viewer" class="fit-width">
      <img />
    </div>
  </div>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init(shadow) {
  /* DOM variables */
  let frag = clone();
  let rootNode = frag.querySelector('#root');
  let viewerNode = frag.querySelector('#viewer');
  let imgNode = frag.querySelector('img');
  let progressNode = frag.querySelector('progress');
  let progressContainerNode = frag.querySelector('.progress-container');
  let fitHeightBtn = frag.querySelector('#fit-height');
  let fitWidthBtn = frag.querySelector('#fit-width');
  let fullscreenBtn = frag.querySelector('#fullscreen');

  /* State variables */
  let src, book;

  /* DOM update functions */
  function setProgressNode(value) {
    progressNode.value = value;
  }

  function setProgressContainerNode(loading) {
    progressContainerNode.classList[loading ? 'add' : 'remove']('open');
  }

  function setImgNode(value) {
    imgNode.src = value;
  }

  function setViewerDisplay(cn) {
    viewerNode.className = cn;
  }

  /* State update functions */
  function setSrc(value) {
    if(src !== value) {
      src = value;
      loadSrc();
    }
  }

  /* Logic functions */
  async function loadPage(i) {
    setProgressContainerNode(true);
    let url = await book.goto(i, setProgressNode);
    setProgressContainerNode(false);
    setImgNode(url);
  }

  async function loadNextPage() {
    if(!book) return;
    setProgressContainerNode(true);
    let url = await book.nextPage(setProgressNode);
    setProgressContainerNode(false);
    setImgNode(url);
  }

  async function loadPreviousPage() {
    if(!book) return;
    setProgressContainerNode(true);
    let url = await book.previousPage(setProgressNode);
    setProgressContainerNode(false);
    setImgNode(url);
  }

  async function loadSrc() {
    book = new ZipBook(src);
    await book.load();
    await loadPage(0);
    book.preloadIdle();
  }

  function closeBook() {
    if(book) {
      book.close();
    }
  }

  /* Event listeners */
  function onImgClick(ev) {
    let w = imgNode.offsetWidth;
    let h = w / 2;
    if(ev.offsetX < h) {
      loadPreviousPage();
    } else {
      loadNextPage();
    }
  }

  function onFitHeightClick() {
    setViewerDisplay('fit-height');
  }

  function onFitWidthClick() {
    setViewerDisplay('fit-width');
  }

  function onKeyUp(ev) {
    switch(ev.keyCode) {
      // Left
      case 37:
        loadPreviousPage();
        break;
      // Right
      case 39:
        loadNextPage();
        break;
    }
  }

  function onFullscreenClick() {
    if(document.fullscreenEnabled) {
      if(shadow.fullscreenElement === rootNode) {
        document.exitFullscreen();
      } else {
        rootNode.requestFullscreen();
      }
    }
  }

  /* Initialization */
  function connect() {
    imgNode.addEventListener('dblclick', onImgClick);
    fitHeightBtn.addEventListener('click', onFitHeightClick);
    fitWidthBtn.addEventListener('click', onFitWidthClick);
    fullscreenBtn.addEventListener('click', onFullscreenClick);
    rootNode.addEventListener('keyup', onKeyUp);
  }

  function disconnect() {
    imgNode.removeEventListener('dblclick', onImgClick);
    fitHeightBtn.removeEventListener('click', onFitHeightClick);
    fitWidthBtn.removeEventListener('click', onFitWidthClick);
    fullscreenBtn.removeEventListener('click', onFullscreenClick);
    rootNode.removeEventListener('keyup', onKeyUp);
    closeBook();
  }

  function update(data = {}) {
    if(data.src) setSrc(data.src);
    return frag;
  }

  Object.defineProperties(update, {
    connect: {
      value: connect
    },
    disconnect: {
      value: disconnect
    },
    src: {
      get() {
        return src;
      }
    }
  });

  return update;
}

const VIEW = Symbol('comic-reader.view');

class ComicReader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if(!this[VIEW]) {
      let update = this[VIEW] = init(this.shadowRoot);
      let frag = update({ });
      this.shadowRoot.appendChild(frag);
    }
    this[VIEW].connect();
  }

  disconnectedCallback() {
    this[VIEW].disconnect();
  }

  get src() {
    return this[VIEW].src;
  }

  set src(src) {
    this[VIEW]({ src });
  }
}

customElements.define('comic-reader', ComicReader);

export default ComicReader;