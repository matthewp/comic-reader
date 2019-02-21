const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
      height: 100%;
    }

    .container, canvas { width: 100%; }

    .container {
      overflow-y: scroll;
      scroll-behavior: smooth;
      overflow-x: hidden;
      height: 100%;
    }
  </style>
  <div class="container">
    <canvas></canvas>
  </div>
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
  let canvasNode = frag.querySelector('canvas');
  let ctx = canvasNode.getContext('2d');
  let imgNode = document.createElement('img');

  /* DOM update functions */
  function setImgNode(value) {
    imgNode.src = value;
  }

  async function setCanvasURL(url, page) {
    setImgNode(url);
    await waitOnImg(imgNode);
    await wait(50);

    let w = imgNode.naturalWidth;
    let h = imgNode.naturalHeight;

    canvasNode.width = w;
    canvasNode.height = h;
    ctx.drawImage(imgNode, 0, 0, w, h);
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
    canvasNode.addEventListener('click', onImgClick);
  }

  function disconnect() {
    canvasNode.removeEventListener('click', onImgClick);
  }

  function update(data = {}) {
    if(data.url) return setCanvasURL(data.url, data.page);
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