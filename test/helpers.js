import '../index.js';

function pad(n) {
  n = n + '';
  return new Array(2 - n.length + 1).join('0') + n;
}

const demoComic = [];
for(let i = 1; i < 11; i++) {
  let num = pad(i);
  let url = new URL(`./data/baffling/Baffling Mysteries 09_${num}.jpg`, import.meta.url);
  demoComic.push(url.toString());
}

const demoSource = {
  getLength() {
    return demoComic.length;
  },
  item(i) {
    return demoComic[i];
  }
}

export async function mount() {
  let el = document.createElement('comic-reader');
  host.appendChild(el);

  function undo() {
    host.removeChild(el);
  }

  return new Promise(resolve => {
    el.addEventListener('load', () => {
      resolve(undo);
    }, { once: true });
    el.src = demoSource;
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
  let el = page.shadowRoot.querySelector('comic-reader-zoom');
  let rect = el.getBoundingClientRect();
  let x;
  if(dir === 'right') {
    x = rect.right - 10;
  } else {
    x = rect.left + 10;
  }
  let ev = new MouseEvent('click', {
    clientX: x,
    screenX: x,
    screenY: 12
  });
  el.dispatchEvent(ev);
}

export async function navigateTo(index) {
  let currentPageNumber = Number(currentPage().dataset.page);
  let dist = index === 0 ?
    Math.abs(currentPageNumber - index) :
    Math.abs(index - currentPageNumber);
  let dir = index > currentPageNumber ? 'right' : 'left';

  let i = 0;
  while(i < dist) {
    await wait(400);
    navigate(dir);
    i++;
  }
}