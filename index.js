import { ZipBook } from './lib/pzip.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
      --white: #fff;
    }

    #root {
      height: 100%;
      position: relative;
      background-color: var(--white);
    }

    .top-pane {
      background: linear-gradient(to bottom,#000 0%,rgba(229,229,229,0) 100%);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 0.75em;
      display: grid;
      grid-template-columns: 1fr 1fr;
      transition: opacity 1s;
      opacity: 0;
    }

    .top-pane.open {
      opacity: 1;
    }

    .top-pane-right {
      justify-self: end;
    }

    .top-pane button.icon {
      height: 50px;
      width: 50px;
      margin: 0 1em;
    }

    button.icon {
      background-color: transparent;
      border: none;
      padding: 0;
    }

    button.icon#fit-height {
      transform: rotate(90deg);
    }

    button.icon svg {
      fill: var(--white);
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

    .fit-height canvas {
      max-height: 100%;
      height: 100%;
      overflow: scroll;
    }

    .fit-width {
      height: 100%;
      overflow: scroll;
    }

    .fit-width canvas {
      width: 100%;
    }
  </style>
  <div id="root" tabindex="0">
    <div class="top-pane controls">
      <div class="top-pane-left">
        <button id="fit-width" class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Fit width</title>
            <path d="M190.4 354.1L91.9 256l98.4-98.1-30-29.9L32 256l128.4 128 30-29.9zm131.2 0L420 256l-98.4-98.1 30-29.9L480 256 351.6 384l-30-29.9z"/></svg>
        </button>
        <button id="fit-height" class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Fit height</title>
            <path d="M190.4 354.1L91.9 256l98.4-98.1-30-29.9L32 256l128.4 128 30-29.9zm131.2 0L420 256l-98.4-98.1 30-29.9L480 256 351.6 384l-30-29.9z"/></svg>
        </button>
      </div>
      <div class="top-pane-right">
        <button id="fullscreen" class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Enter fullscreen</title>
            <path d="M396.795 396.8H320V448h128V320h-51.205zM396.8 115.205V192H448V64H320v51.205zM115.205 115.2H192V64H64v128h51.205zM115.2 396.795V320H64v128h128v-51.205z"/></svg>
        </button>
      </div>
    </div>
    <div class="progress-container">
      <progress value="0" max="100"></progress>
    </div>
    <div id="viewer" class="fit-width">
      <canvas class="current"></canvas>
    </div>
  </div>
`;

function clone() {
  return document.importNode(template.content, true);
}

function contractSVG() {
  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 512 512');
  svg.innerHTML = `<title>Exit fullscreen</title><path d="M64 371.2h76.795V448H192V320H64v51.2zm76.795-230.4H64V192h128V64h-51.205v76.8zM320 448h51.2v-76.8H448V320H320v128zm51.2-307.2V64H320v128h128v-51.2h-76.8z"/>`;
  return svg;
}

function clear(el) {
  while(el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function init(shadow) {
  /* DOM variables */
  let frag = clone();
  let rootNode = frag.querySelector('#root');
  let viewerNode = frag.querySelector('#viewer');
  let canvasNode = frag.querySelector('canvas');
  let controlsNode = frag.querySelector('.controls');
  let progressNode = frag.querySelector('progress');
  let progressContainerNode = frag.querySelector('.progress-container');
  let fitHeightBtn = frag.querySelector('#fit-height');
  let fitWidthBtn = frag.querySelector('#fit-width');
  let fullscreenBtn = frag.querySelector('#fullscreen');
  let imgNode = document.createElement('img');
  let ctx = canvasNode.getContext('2d');
  let expandNode = fullscreenBtn.firstElementChild;
  let contractNode = contractSVG();

  /* State variables */
  let src, book;
  let panelMode = false;

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

  function setFullscreenButton(isFullscreen) {
    let newChild = isFullscreen ? contractNode : expandNode;
    clear(fullscreenBtn);
    fullscreenBtn.appendChild(newChild);
  }

  function toggleControlsOpen() {
    controlsNode.classList.toggle('open');
  }

  function setControlsOpen(open) {
    controlsNode.classList[open ? 'add' : 'remove']('open');
  }

  /* State update functions */
  function setSrc(value) {
    if(src !== value) {
      src = value;
      loadSrc();
    }
  }

  /* Logic functions */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function waitOnImg(img) {
    return new Promise(resolve => {
      if(img.naturalHeight) {
        resolve(img);
      } else {
        img.onload = function() {
          resolve(img);
        };
      }
    });
  }

  async function setCanvasURL(url) {
    setImgNode(url);
    await wait(0);
    await waitOnImg(imgNode);

    let w = imgNode.naturalWidth;
    let h = imgNode.naturalHeight;
    
    canvasNode.width = w;
    canvasNode.height = h;
    ctx.drawImage(imgNode, 0, 0, w, h);
  }

  async function loadPage(i) {
    setProgressContainerNode(true);
    let url = await book.goto(i, setProgressNode);
    setProgressContainerNode(false);
    setCanvasURL(url);
  }

  async function loadNextPage() {
    if(!book) return;
    setProgressContainerNode(true);
    let url = await book.nextPage(setProgressNode);
    setProgressContainerNode(false);
    setCanvasURL(url);
  }

  async function loadPreviousPage() {
    if(!book) return;
    setProgressContainerNode(true);
    let url = await book.previousPage(setProgressNode);
    setProgressContainerNode(false);
    setCanvasURL(url);
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

  function getClickPosition(ev) {
    let w = canvasNode.offsetWidth;
    let third = w / 3;
    let x = ev.offsetX;
    return x < third ? 0 : x > (third * 2) ? 2 : 1;
  }

  function scheduleControlsOff() {
    setTimeout(setControlsOpen, 2000, false);
  }

  /* Event listeners */
  function onImgDlbClick(ev) {
    let w = imgNode.naturalWidth;
    let h = w / 2;
    if(ev.offsetX < h) {
      loadPreviousPage();
    } else {
      loadNextPage();
    }
  }

  function onImgClick(ev) {
    switch(getClickPosition(ev)) {
      case 0:
      case 2:
        break;
      case 1:
        toggleControlsOpen();
        break;
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
      let isFullscreen = false;
      function onComplete() {
        setFullscreenButton(isFullscreen);
        scheduleControlsOff();
      }

      if(shadow.fullscreenElement === rootNode) {
        document.exitFullscreen().then(onComplete);
      } else {
        isFullscreen = true;
        rootNode.requestFullscreen().then(onComplete);
      }
    }
  }

  /* Initialization */
  function connect() {
    canvasNode.addEventListener('click', onImgClick);
    canvasNode.addEventListener('dblclick', onImgDlbClick);
    fitHeightBtn.addEventListener('click', onFitHeightClick);
    fitWidthBtn.addEventListener('click', onFitWidthClick);
    fullscreenBtn.addEventListener('click', onFullscreenClick);
    rootNode.addEventListener('keyup', onKeyUp);
  }

  function disconnect() {
    canvasNode.removeEventListener('click', onImgClick);
    canvasNode.removeEventListener('dblclick', onImgClick);
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