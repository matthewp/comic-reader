import { type default as PinchZoom } from './zoom.js';
import './zoom.js';

const EASE_QUADRATIC = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const EASE_CIRCULAR = 'cubic-bezier(0.1, 0.57, 0.1, 1)';

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
      transition-timing-function: ${EASE_QUADRATIC};
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
  let containerNode = frag.querySelector<HTMLElement>('.container')!;
  let canvasNode = frag.querySelector<HTMLCanvasElement>('canvas')!;
  let zoomNode = frag.querySelector('comic-reader-zoom')! as PinchZoom;
  let ctx = canvasNode.getContext('2d')!;
  let imgNode: HTMLImageElement | undefined;

  /* DOM update functions */
  function setImg(value: HTMLImageElement) {
    if(value !== imgNode) {
      imgNode = value;
      drawCanvas();
      resetZoomPosition();
    }
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

  async function drawCanvas() {
    setContainerLoaded(false);
    await waitOnImg(imgNode);
    await wait(50);

    let w = imgNode!.naturalWidth;
    let h = imgNode!.naturalHeight;

    canvasNode.width = w;
    canvasNode.height = h;
    ctx.drawImage(imgNode!, 0, 0, w, h);
    setContainerLoaded(true);
    dispatchDraw();
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
    let { left, width } = containerNode.getBoundingClientRect();
    let pageX = ev.pageX;
    let x = pageX - left;

    let third = width / 3;
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
    host.dispatchEvent(ev);
  }

  /* Event listeners */
  function onImgClick(ev) {
    if(ev.defaultPrevented) {
      return;
    }
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

  type Data = {
    image?: HTMLImageElement;
  }

  function update(data: Data = {}) {
    if(data.image) setImg(data.image);
    return frag;
  }

  update.connect = connect;
  update.disconnect = disconnect;

  return update;
}

class ComicReaderPage extends HTMLElement {
  #view: ReturnType<typeof init>;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#view = init(this);
  }

  connectedCallback() {
    let update = this.#view;
    if(!this.shadowRoot!.hasChildNodes())
      this.shadowRoot!.append(update());
    update.connect();
  }

  disconnectedCallback() {
    this.#view.disconnect();
  }

  set image(image: HTMLImageElement) {
    this.#view({ image });
  }
}

customElements.define('comic-reader-page', ComicReaderPage);