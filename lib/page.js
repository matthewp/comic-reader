import './zoom.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
      height: 100%;
    }

    .container, comic-reader-zoom, canvas { width: 100%; }

    .container {
      display: block;
      overflow-y: scroll;
      scroll-behavior: smooth;
      overflow-x: hidden;
      height: 100%;
    }

    .container.loaded {
      background-color: #000;
    }

    comic-reader-zoom {
      display: block;
      overflow: hidden;
      touch-action: none;
      --scale: 1;
      --x: 0;
      --y: 0;
    }

    comic-reader-zoom.zoom-band > * {
      transition: transform .2s ease-in-out;
    }

    comic-reader-zoom.momentum > * {
      transition-property: transform;
      transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transition-duration: var(--momentum);
    }

    comic-reader-zoom > * {
      transform: translate(var(--x), var(--y)) scale(var(--scale));
      transform-origin: 0 0;
      will-change: transform;
    }
  </style>
  <comic-reader-zoom class="container">
    <canvas></canvas>
  </comic-reader-zoom>
`;

function clone() {
  return document.importNode(template.content, true);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function init(host) {
  /* DOM variables */
  let frag = clone();
  let containerNode = frag.querySelector('.container');
  let canvasNode = frag.querySelector('canvas');
  let zoomNode = frag.querySelector('comic-reader-zoom');
  let ctx = canvasNode.getContext('2d');
  let imgNode = document.createElement('img');

  /* State variables */
  let url;

  /* DOM update functions */
  function setImgNode(value) {
    imgNode.src = value;
  }

  function setContainerLoaded(value) {
    containerNode.classList[value ? 'add' : 'remove']('loaded');
  }

  function resetZoomPosition() {
    zoomNode.setTransform({
      x: 0,
      y: 0,
      scale: 1
    });
  }

  async function setCanvasURL(url) {
    setContainerLoaded(false);
    setImgNode(url);
    await waitOnImg(imgNode);
    await wait(50);

    let w = imgNode.naturalWidth;
    let h = imgNode.naturalHeight;

    canvasNode.width = w;
    canvasNode.height = h;
    ctx.drawImage(imgNode, 0, 0, w, h);
    setContainerLoaded(true);
    dispatchDraw();
  }

  /* State update functions */
  function setURL(value) {
    if(value !== url) {
      url = value;
      setCanvasURL(value);
      resetZoomPosition();
    }
  }

  /* Logic functions */
  function waitOnImg(img) {
    return new Promise(resolve => {
      if(img.naturalHeight) {
        resolve(img);
      } else {
        img.onload = () => resolve(img);
      }
    });
  }

  function getClickPosition(ev) {
    let w = canvasNode.offsetWidth;
    let third = w / 3;
    let x = ev.offsetX;
    return x < third ? 0 : x > (third * 2) ? 2 : 1;
  }

  /* Event dispatchers */
  function dispatchNavPrevious() {
    let ev = new CustomEvent('nav-previous');
    host.dispatchEvent(ev);
  }

  function dispatchNavNext() {
    let ev = new CustomEvent('nav-next');
    host.dispatchEvent(ev);
  }

  function dispatchControls() {
    let ev = new CustomEvent('controls');
    host.dispatchEvent(ev);
  }

  function dispatchDraw() {
    let ev = new CustomEvent('draw');
    canvasNode.dispatchEvent(ev);
  }

  /* Event listeners */
  function onImgClick(ev) {
    switch(getClickPosition(ev)) {
      case 0: dispatchNavPrevious(); break;
      case 2: dispatchNavNext(); break;
      case 1: dispatchControls(); break;
    }
  }

  /* Init functionality */
  function connect() {
    containerNode.addEventListener('click', onImgClick);
  }

  function disconnect() {
    containerNode.removeEventListener('click', onImgClick);
  }

  function update(data = {}) {
    if(data.url) return setURL(data.url);
    return frag;
  }

  update.connect = connect;
  update.disconnect = disconnect;

  return update;
}

const VIEW = Symbol('view');

class ComicReaderPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this[VIEW] = init(this);
  }

  connectedCallback() {
    let update = this[VIEW];
    if(!this.shadowRoot.firstChild)
      this.shadowRoot.appendChild(update());
    update.connect();
  }

  disconnectedCallback() {
    this[VIEW].disconnect();
  }

  set url(url) {
    this[VIEW]({ url });
  }
}

customElements.define('comic-reader-page', ComicReaderPage);