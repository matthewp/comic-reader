import '../index.js';

const defaultDemo = new URL('../demo/demo.cbz', import.meta.url).toString();

export async function mount(demo = defaultDemo) {
  let el = document.createElement('comic-reader');
  host.appendChild(el);

  function undo() {
    host.removeChild(el);
  }

  return new Promise(resolve => {
    el.addEventListener('load', () => {
      resolve(undo);
    }, { once: true });
    el.src = demo;
  })
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function waitFor(eventName) {
  let el = host.firstChild;

  return new Promise(resolve => {
    el.addEventListener(eventName, resolve, { once: true });
  });
}

export function el() {
  return host.firstChild;
}

export function shadow() {
  return host.firstChild.shadowRoot;
}

export function currentPage() {
  return shadow().querySelector('comic-reader-page.current');
}

export function navigate(dir) {
  let page = currentPage();
  let canvas = page.shadowRoot.querySelector('canvas');
  let width = canvas.offsetWidth;
  let x;
  if(dir === 'right') {
    x = width - 10;
  } else {
    throw new Error('left not yet supported');
  }
  let ev = new MouseEvent('click', {
    clientX: x,
    screenX: x,
    screenY: 12
  });
  canvas.dispatchEvent(ev);
}