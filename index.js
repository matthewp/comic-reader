import { ZipBook } from './lib/pzip.js';
import canvasView from './lib/canvas-view.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
      --white: #fff;
    }

    #root {
      height: 100%;
      width: 100%;
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
      user-select: none;
      grid-template-columns: 1fr 1fr;
      transition: opacity 1s;
      opacity: 0;
      z-index: 1;
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

    #viewport {
      overflow-y: scroll;
      overflow-x: hidden;
      height: 100%;
      width: 100%;
    }

    #viewer {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      --x: 0;
      transform: translateX(var(--x));
    }

    #viewer:not(.updating) {
      transition: transform .3s ease-out;
    }

    .fit-height {
      height: 100%;
      width: 100%;
      justify-content: center;
    }

    .fit-height canvas {
      height: 100%;
    }

    .fit-height .current {
      grid-column: 1 / 6;
      justify-self: center;
    }

    .fit-height :not(.current) {
      display: none;
    }

    .fit-width {
      width: 500%;
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
    <div id="viewport">
      <div id="viewer" class="fit-width">
        <canvas class="current"></canvas>
        <canvas></canvas>
        <canvas></canvas>
        <canvas></canvas>
        <canvas></canvas>
      </div>
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
  let controlsNode = frag.querySelector('.controls');
  let progressNode = frag.querySelector('progress');
  let progressContainerNode = frag.querySelector('.progress-container');
  let fitHeightBtn = frag.querySelector('#fit-height');
  let fitWidthBtn = frag.querySelector('#fit-width');
  let fullscreenBtn = frag.querySelector('#fullscreen');
  let expandNode = fullscreenBtn.firstElementChild;
  let contractNode = contractSVG();
  let canvases = frag.querySelectorAll('canvas');

  /* DOM views */
  let updateCurrent;
  let updateCanvases = [];
  let canvasToUpdate = new WeakMap();
  for(let canvas of canvases) {
    let update = canvasView(canvas)
    updateCanvases.push(update);
    canvasToUpdate.set(canvas, update);
  }
  updateCurrent = updateCanvases[0];

  /* State variables */
  let src, book, numberOfPages;
  let viewerX = 0, current = 0, currentPage = 0;

  /* DOM update functions */
  function setProgressNode(value) {
    progressNode.value = value;
  }

  function setProgressContainerNode(loading) {
    progressContainerNode.classList[loading ? 'add' : 'remove']('open');
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

  function translateViewerNode() {
    viewerNode.style.setProperty('--x', `${viewerX}%`);
  }

  function setViewerUpdating(isUpdating) {
    viewerNode.classList[isUpdating ? 'add' : 'remove']('updating');
  }

  function rotateCanvasNode(first) {
    if(first) {
      let node = viewerNode.firstElementChild;
      viewerNode.appendChild(node);
      return node;
    } else {
      let node = viewerNode.lastElementChild;
      viewerNode.insertBefore(node, viewerNode.firstElementChild);
      return node;
    }
  }

  /* State update functions */
  function setSrc(value) {
    if(src !== value) {
      src = value;
      loadSrc();
    }
  }

  function setViewerX(value) {
    if(viewerX !== value) {
      viewerX = value;
      translateViewerNode();
    }
  }

  function setCurrent(value) {
    if(value !== current) {
      if(value < 5) {
        current = value;
      } else {
        current = 0;
      }
    }
  }

  function setCurrentPage(value) {
    if(value !== currentPage) {
      if(value >= 0) {
        let oldValue = currentPage;
        currentPage = value;
        // If we're going up
        if(oldValue < value) {
          incrementViewerX(-20);
        } else {
          incrementViewerX(20);
        }
      }
    }
  }

  function incrementViewerX(by) {
    let newValue = viewerX + by;
    if(newValue <= 0) {
      setViewerX(newValue);
    }
  }

  /* Logic functions */
  async function loadInto(i, updateCanvas) {
    let url = await book.goto(i);
    updateCanvas({ url, page: i });
  }

  async function loadPage(i) {
    setProgressContainerNode(true);
    let url = await book.goto(i, setProgressNode);
    setProgressContainerNode(false);
    updateCurrent({ url, page: i });
  }

  async function loadSrc() {
    let blob = src;
    if(typeof src === 'string') {
      let url = new URL(src, location.href).toString();
      let res = await fetch(url);
      blob = await res.blob();
    }

    book = new ZipBook(blob);
    await book.load();
    numberOfPages = book.getLength();
    await loadPage(0);
    book.preloadIdle();

    for(let i = 1; i < 5; i++) {
      if(book.canAdvanceTo(i)) {
        let nextUrl = await book.peek(i);
        updateCanvases[i]({ url: nextUrl, page: i });
      }
    }
  }

  function closeBook() {
    if(book) {
      book.close();
    }
  }

  function scheduleControlsOff() {
    setTimeout(setControlsOpen, 2000, false);
  }

  function navigateToNext() {
    setCurrentPage(currentPage + 1);
    setCurrent(current + 1);
  }

  function navigateToPrevious() {
    setCurrentPage(currentPage - 1);
    setCurrent(current - 1);
  }

  function rotatePage() {
    for(let i = 0; i < updateCanvases.length; i++) {
      let updateCanvas = updateCanvases[i];
      updateCanvas({ current: i === current });
    }
    
    let i = 0;
    let currentIndex = 0;
    for(let canvas of viewerNode.children) {
      if(canvas.classList.contains('current')) {
        currentIndex = i;
        break;
      }
      i++;
    }

    // Move last canvas to before
    if(currentIndex === 1 && currentPage > 1) {
      setViewerUpdating(true);
      let canvas = rotateCanvasNode(false);
      incrementViewerX(-20);
      setTimeout(setViewerUpdating, 0, false);
      let updateCanvas = canvasToUpdate.get(canvas);
      loadInto(currentPage - 2, updateCanvas);
    }
    // Move first canvas to last
    else if(currentIndex === 3 && currentPage + 2 < numberOfPages) {
      setViewerUpdating(true);
      let canvas = rotateCanvasNode(true);
      incrementViewerX(20);
      setTimeout(setViewerUpdating, 0, false);
      let updateCanvas = canvasToUpdate.get(canvas);
      loadInto(currentPage + 2, updateCanvas);
    }
  }

  /* Event listeners */
  function onNavPrevious() {
    navigateToPrevious();
  }

  function onNavNext() {
    navigateToNext();
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
        navigateToPrevious();
        break;
      // Right
      case 39:
        navigateToNext();
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

  function onViewerTransition() {
    rotatePage();
  }

  /* Initialization */
  function connect() {
    for(let updateCanvas of updateCanvases) {
      updateCanvas.connect();
      updateCanvas.node.addEventListener('nav-previous', onNavPrevious);
      updateCanvas.node.addEventListener('nav-next', onNavNext);
      updateCanvas.node.addEventListener('controls', toggleControlsOpen);
    }
    
    fitHeightBtn.addEventListener('click', onFitHeightClick);
    fitWidthBtn.addEventListener('click', onFitWidthClick);
    fullscreenBtn.addEventListener('click', onFullscreenClick);
    rootNode.addEventListener('keyup', onKeyUp);
    viewerNode.addEventListener('transitionend', onViewerTransition);
  }

  function disconnect() {
    for(let updateCanvas of updateCanvases) {
      updateCanvas.disconnect();
      updateCanvas.node.removeEventListener('nav-previous', onNavPrevious);
      updateCanvas.node.removeEventListener('nav-next', onNavNext);
      updateCanvas.node.removeEventListener('controls', toggleControlsOpen);
    }

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

  update.connect = connect;
  update.disconnect = disconnect;

  return update;
}

const VIEW = Symbol('comic-reader.view');

class ComicReader extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._src = null;
  }

  connectedCallback() {
    if(!this[VIEW]) {
      let update = this[VIEW] = init(this.shadowRoot);
      let frag = update({ src: this._src });
      this.shadowRoot.appendChild(frag);
    }
    this[VIEW].connect();
  }

  disconnectedCallback() {
    this[VIEW].disconnect();
  }

  attributeChangedCallback(name, _, newVal) {
    this[name] = newVal;
  }

  get src() {
    return this._src;
  }

  set src(src) {
    this._src = src;
    if(this[VIEW])
      this[VIEW]({ src });
  }
}

customElements.define('comic-reader', ComicReader);

export default ComicReader;