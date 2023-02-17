import './page.js';

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    :host {
      display: block;
      --white: #fff;
      --pane-bg: #36454F;
    }

    #root {
      height: 100%;
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .pane {
      position: absolute;
      left: 0;
      right: 0;
      user-select: none;
    }

    .pane button.icon,
    .pane .button.icon {
      display: inline-block;
      height: 40px;
      width: 40px;
      margin: 0.3em 1em;
    }

    .top-pane {
      display: grid;
      grid-template-columns: 1fr min-content;
      grid-template-rows: 1fr 1fr;
      background: linear-gradient(to bottom,#000 0%,rgba(229,229,229,0) 100%);
      top: 0;
      padding: 0.75em;
      transition: opacity 1s;
      opacity: 0;
      z-index: 1;
    }

    .top-pane.open,
    .top-pane:focus-within {
      opacity: 1;
    }

    .top-pane > *:first-child,
    .top-pane > *:last-child {
      grid-row: 1 / 3;
      align-self: center;
    }

    .top-pane .book-info {
      color: var(--white);
      margin: 0;
      align-self: center;

      grid-column: 1;
      margin-left: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .top-pane.show-left {
      grid-template-columns: min-content 1fr min-content;
    }

    .top-pane.show-left .book-info {
      grid-column: 2;
      margin-left: 0;
    }

    slot[name=top-left-nav] {
      display: inline-block;
    }

    :host(:not([title])) .top-pane:not(.has-title) #page-progress {
      grid-row: 1 / 3;
    }

    .top-pane h1 {
      font-size: 22px;
    }

    .top-pane h2 {
      grid-row: 2;
      grid-column: 2;
      font-size: 16px;
    }

    #page-progress {
      opacity: 0;
      transition: opacity .5s;
    }

    #root.loaded #page-progress {
      opacity: 1;
    }

    .browser {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--pane-bg);
      z-index: 1;
      transform: translateY(100%);
      transition: transform .4s;
    }

    .browser.open {
      transform: translateY(0%);
    }

    .browser header {
      background: inherit;
      padding: .5em .2em .5em .75em;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .browser h1 {
      font-size: 22px;
      margin: 0;
      color: var(--white);
    }

    .bottom-pane {
      background: var(--pane-bg);
      bottom: 0;
      padding: .5rem;
      transform: translateY(calc(50px + 1rem));
      transition: transform .5s;
    }

    .bottom-pane.open,
    .bottom-pane:focus-within {
      transform: translateY(0px);
    }

    button.icon,
    .button.icon {
      background-color: transparent;
      border: none;
      padding: 0;
    }

    button.icon#fit-height {
      transform: rotate(90deg);
    }

    button.icon svg,
    .button.icon svg {
      fill: var(--white);
    }

    .progress-container,
    .cover {
      display: none;
    }

    .progress-container.open,
    #root:not(.first-page-loaded) .cover[src] {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 100%;
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
      overflow: hidden;
      height: 100%;
      width: 100%;
    }

    #viewer {
      display: flex;
      height: 100%;
      --x: 0;
      transform: translateX(var(--x));
    }

    #viewer:not(.updating) {
      transition: transform .3s ease-out;
    }

    @media (prefers-reduced-motion: reduce) {
      #viewer:not(.updating) {
        transition-duration: 0.1s !important;
      }
    }

    .fit-height {
      height: 100%;
      width: 100%;
      justify-content: center;
    }

    .fit-height comic-reader-page {
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

    .fit-width comic-reader-page {
      width: 100%;
    }

    @media all and (display-mode: fullscreen) {
      #root:not(:fullscreen) #fullscreen {
        display: none;
      }
    }
  </style>
  <div id="root" tabindex="0">
    <div class="top-pane pane controls">
      <slot name="top-left-nav"></slot>
      <h1 id="book-title" class="book-info"></h1>
      <h2 id="page-progress" class="book-info"><span id="current-page"></span><span> of </span><span id="total-pages"></span></h2>
      <button id="fullscreen" class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Enter fullscreen</title>
          <path d="M396.795 396.8H320V448h128V320h-51.205zM396.8 115.205V192H448V64H320v51.205zM115.205 115.2H192V64H64v128h51.205zM115.2 396.795V320H64v128h128v-51.205z"/></svg>
      </button>
    </div>
    <img alt="Book cover" class="cover" />
    <div class="progress-container">
      <progress value="0" max="100"></progress>
    </div>
    <div id="viewport">
      <div id="viewer" class="fit-width">
        <comic-reader-page class="current"></comic-reader-page>
        <comic-reader-page></comic-reader-page>
        <comic-reader-page></comic-reader-page>
        <comic-reader-page></comic-reader-page>
        <comic-reader-page></comic-reader-page>
      </div>
    </div>

    <div class="browser">
      <header class="pane">
        <h1>Browse pages</h1>
        <button id="close-browser" class="icon">        
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Close page browser</title>
            <path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"/></svg>
        </button>
      </header>
    </div>

    <div class="bottom-pane pane controls">
      <button id="browse" class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Browse pages</title>
          <path d="M409.6 64H102.4C81.3 64 64 81.3 64 102.4v307.2c0 21.1 17.3 38.4 38.4 38.4h307.2c21.1 0 38.4-17.3 38.4-38.4V102.4c0-21.1-17.3-38.4-38.4-38.4zM179.2 409.6h-76.8v-76.8h76.8v76.8zm0-115.2h-76.8v-76.8h76.8v76.8zm0-115.2h-76.8v-76.8h76.8v76.8zm115.2 230.4h-76.8v-76.8h76.8v76.8zm0-115.2h-76.8v-76.8h76.8v76.8zm0-115.2h-76.8v-76.8h76.8v76.8zm115.2 230.4h-76.8v-76.8h76.8v76.8zm0-115.2h-76.8v-76.8h76.8v76.8zm0-115.2h-76.8v-76.8h76.8v76.8z"/></svg>
      </button>
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
      <div></div>
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
  let host = this;
  let frag = clone();
  let rootNode = frag.querySelector('#root');
  let viewerNode = frag.querySelector('#viewer');
  let controlsNodes = frag.querySelectorAll('.controls');
  let progressNode = frag.querySelector('progress');
  let progressContainerNode = frag.querySelector('.progress-container');
  let coverImgNode = frag.querySelector('.cover');
  let browserNode = frag.querySelector('.browser');
  let fitHeightBtn = frag.querySelector('#fit-height');
  let fitWidthBtn = frag.querySelector('#fit-width');
  let browseBtn = frag.querySelector('#browse');
  let titleNode = frag.querySelector('#book-title');
  let currentPageNode = frag.querySelector('#current-page');
  let totalPagesNode = frag.querySelector('#total-pages');
  let topLeftNavSlot = frag.querySelector('slot[name=top-left-nav]');
  let topPaneNode = frag.querySelector('.top-pane');
  let fullscreenBtn = frag.querySelector('#fullscreen');
  let expandNode = fullscreenBtn.firstElementChild;
  let contractNode = contractSVG();
  let readerPageNodes = Array.from(frag.querySelectorAll('comic-reader-page'));
  let currentReaderPageNode = readerPageNodes[0];

  /* DOM views */
  let updateBrowser;

  /* State variables */
  let cover, src, source, title, totalPages, imgMap;
  let viewerX = 0, navEnabled = true,
  currentPage = 0, nextPage = 0, numberOfItemsLoaded = 0;

  /* DOM update functions */
  function setProgressNode(value) {
    progressNode.value = value;
  }

  function setProgressContainerNode(loading) {
    progressContainerNode.classList[loading ? 'add' : 'remove']('open');
  }

  function setCoverImgNode(value) {
    coverImgNode.setAttribute('src', value);
  }

  function setViewerDisplay(cn) {
    viewerNode.className = cn;
  }

  function setFullscreenButton(isFullscreen) {
    let newChild = isFullscreen ? contractNode : expandNode;
    clear(fullscreenBtn);
    fullscreenBtn.appendChild(newChild);
  }

  function blurFullscreen() {
    fullscreenBtn.blur();
  }

  function toggleControlsOpen() {
    for(let controlsNode of controlsNodes) {
      controlsNode.classList.toggle('open');
    }
  }

  function setControlsOpen(open) {
    for(let controlsNode of controlsNodes) {
      controlsNode.classList[open ? 'add' : 'remove']('open');
    }
  }

  function translateViewerNode() {
    viewerNode.style.setProperty('--x', `${viewerX}%`);
  }

  function setViewerUpdating(isUpdating) {
    viewerNode.classList[isUpdating ? 'add' : 'remove']('updating');
  }

  function setReaderPageCurrent(readerPage, isCurrent) {
    readerPage.classList[isCurrent ? 'add' : 'remove']('current');
  }

  function setTitleNode() {
    titleNode.textContent = title;
  }

  function setTotalPagesNode() {
    totalPagesNode.textContent = totalPages;
  }

  function setCurrentPageNode() {
    currentPageNode.textContent = currentPage + 1;
  }

  function setFirstPageLoaded() {
    rootNode.classList.add('first-page-loaded');
  }

  function setBookLoaded() {
    rootNode.classList.add('loaded');
  }

  function setTopLeftNav() {
    let nodes = topLeftNavSlot.assignedNodes();
    topPaneNode.classList[nodes.length ? 'add' : 'remove']('show-left');
  }

  function setTopHasTitle() {
    topPaneNode.classList[title ? 'add' : 'remove']('has-title');
  }

  function setBrowserOpen() {
    browserNode.classList.add('open');
  }

  /* State update functions */
  function setCover(value) {
    if(cover !== value) {
      cover = value;
      setCoverImgNode(value);
    }
  }

  function setSrc(value) {
    if(src !== value) {
      src = value;
      imgMap = new Map();
      loadSrc();
    }
  }

  function setCurrentPage(value) {
    currentPage = value;
    setCurrentPageNode();
  }

  function setPage(value) {
    if(currentPage !== value) {
      setCurrentPage(value);

      // If a src is already set
      if(src) {
        nextPage = value;
        rotatePage();
      }
    }
  }

  function setViewerX(value) {
    if(viewerX !== value) {
      viewerX = value;
      translateViewerNode();
    }
  }

  function setNextPage(value) {
    if(value !== nextPage) {
      let diff = Math.abs(currentPage - value);
      if(diff <= 2 && value >= 0 && source.getLength() > value) {
        let oldValue = nextPage;
        nextPage = value;
        // If we're going up
        if(oldValue < value) {
          incrementViewerX(-20);
        } else {
          incrementViewerX(20);
        }
        return true;
      } else {
        return false;
      }
    }
  }

  function incrementViewerX(by) {
    let newValue = viewerX + by;
    if(newValue <= 0) {
      setViewerX(newValue);
    }
  }

  function enableNav() {
    navEnabled = true;
    setViewerUpdating(false);
  }

  function disableNav() {
    navEnabled = false;
  }

  function setTitle(value) {
    if(title !== value) {
      title = value;
      setTitleNode();
      setTopHasTitle();
    }
  }

  function setTotalPages(value) {
    if(totalPages !== value) {
      totalPages = value;
      setTotalPagesNode();
    }
  }

  function getImgFromUrl(url) {
    let img = imgMap.get(url);
    if(!img) {
      img = document.createElement('img');
      img.src = url;
      imgMap.set(url, img);
    }
    return img;
  }

  /* Logic functions */
  function browserIsOpen() {
    return browserNode.classList.contains('open');
  }

  async function preloadIdle() {
    requestIdleCallback(preload);
  }

  async function preload() {
    if(source.getLength() > numberOfItemsLoaded) {
      await source.item(numberOfItemsLoaded);
      numberOfItemsLoaded++;
      requestIdleCallback(preload);
    } else {
      setTotalPages(source.getLength());
      setBookLoaded();
    }
  }

  async function loadInto(i, readerPage) {
    let url = await source.item(i);
    let img = getImgFromUrl(url);
    readerPage.dataset.page = i;
    readerPage.image = img;
  }

  async function loadPage(i) {
    let showProgress = !cover;
    if(showProgress) {
      setProgressContainerNode(true);
    }

    await source.item(i, updateProgress);

    if(showProgress) {
      setProgressContainerNode(false);
    }
  }

  async function loadSrc() {
    if(typeof src === 'object' && !(src instanceof Blob)) {
      source = src;
    } else {
      let blob = src;
      if(typeof src === 'string') {
        let url = new URL(src, location.href).toString();
        let res = await fetch(url);
        if(!res.ok) {
          return;
        }
        blob = await res.blob();
      }

      const { default: ZipSource } = await import('./zipsource.js');
      source = new ZipSource(blob);
    }
    
    await loadPage(currentPage);
    preloadIdle();
    setCurrentPageNode();
    setTotalPages(source.getLength());
    rotatePage();

    // Dispatch the load event
    setTimeout(dispatchLoad, 0);
  }

  function updateProgress(value) {
    if(!cover) {
      setProgressNode(value);
    }
  }

  function closeBook() {
    if(source && source.close) {
      source.close();
      imgMap = null;
    }
  }

  function scheduleControlsOff() {
    blurFullscreen();
    setTimeout(setControlsOpen, 2000, false);
  }

  function navigateToNext() {
    if(navEnabled) {
      setNextPage(nextPage + 1); 
    }
  }

  function navigateToPrevious() {
    if(navEnabled) {
      setNextPage(nextPage - 1);
    }
  }

  function rotatePage() {
    if(!source) {
      return;
    }

    disableNav();
    setViewerUpdating(true);

    let expectedPages, newViewerX = 0;
    setReaderPageCurrent(currentReaderPageNode, false);

    if(nextPage < 2) {
      expectedPages = new Set([0, 1, 2, 3, 4]);
    } else if(nextPage + 2 >= source.getLength()) {
      let len = source.getLength();
      expectedPages = new Set();
      for(let i = len - 5; i < len; i++) {
        expectedPages.add(i);
      }
    } else {
      expectedPages = new Set([nextPage - 2, nextPage - 1, nextPage, nextPage + 1, nextPage + 2]);
    }

    let currentMap = new Map();
    for(let i = 0; i < 5; i++) {
      let readerPage = viewerNode.children.item(i);
      let pageNumber = Number(readerPage.dataset.page);
      currentMap.set(pageNumber, readerPage);
    }

    // Now diff
    let i = 0;
    for(let expectedNumber of expectedPages) {
      let slotReaderPage = viewerNode.children.item(i);
      let readerPage = currentMap.get(expectedNumber);

      // In the right slot, continue
      if(slotReaderPage === readerPage) {

      }
      // We have the page, it's just in the wrong slot
      else if(readerPage) {
        viewerNode.insertBefore(readerPage, slotReaderPage);
      }
      // Use this page, if it's no longer used
      else if(!expectedPages.has(Number(slotReaderPage.dataset.page))) {
        readerPage = slotReaderPage;
        loadInto(expectedNumber, slotReaderPage);
      }
      // Find a page we can use
      else {
        let node = viewerNode.lastElementChild;
        while(node) {
          if(!expectedPages.has(Number(node.dataset.page))) {
            readerPage = node;
            viewerNode.insertBefore(node, slotReaderPage);
            loadInto(expectedNumber, node);
            break;
          }
          node = node.previousElementSibling;
        }
      }

      if(expectedNumber === nextPage) {
        setReaderPageCurrent(readerPage, true);
        currentReaderPageNode = readerPage;
        newViewerX = 0 - (i * 20);
      }

      i++;
    }

    setViewerX(newViewerX);
    
    setTimeout(enableNav, 0);
    setCurrentPage(nextPage);
  }

  async function loadBrowser() {
    if(!updateBrowser) {
      let init = (await import('./browser.js')).default;
      updateBrowser = init(browserNode);
    }

    updateBrowser({ currentPage, setPage });
  }

  /* Event dispatchers */
  function dispatchLoad() {
    let ev = new CustomEvent('load');
    host.dispatchEvent(ev);
  }

  function dispatchPage() {
    let ev = new CustomEvent('page', {
      detail: currentPage + 1 // Make it human readable
    });
    host.dispatchEvent(ev);
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

  function onBrowseClick() {
    setBrowserOpen();
    loadBrowser();
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
    dispatchPage();
  }

  function onTopLeftSlotChange() {
    setTopLeftNav();
  }

  function onBrowserTransition() {
    if(browserIsOpen()) {
      updateBrowser({ source });
    }
    setControlsOpen(false);
  }

  /* Initialization */
  function connect() {
    for(let readerPage of readerPageNodes) {
      readerPage.addEventListener('nav-previous', onNavPrevious);
      readerPage.addEventListener('nav-next', onNavNext);
      readerPage.addEventListener('controls', toggleControlsOpen);
    }
    
    fitHeightBtn.addEventListener('click', onFitHeightClick);
    fitWidthBtn.addEventListener('click', onFitWidthClick);
    browseBtn.addEventListener('click', onBrowseClick);
    fullscreenBtn.addEventListener('click', onFullscreenClick);
    rootNode.addEventListener('keyup', onKeyUp);
    viewerNode.addEventListener('transitionend', onViewerTransition);
    browserNode.addEventListener('transitionend', onBrowserTransition);
    topLeftNavSlot.addEventListener('slotchange', onTopLeftSlotChange);
    currentReaderPageNode.addEventListener('draw', setFirstPageLoaded, { once: true });
  }

  function disconnect() {
    for(let readerPage of readerPageNodes) {
      readerPage.removeEventListener('nav-previous', onNavPrevious);
      readerPage.removeEventListener('nav-next', onNavNext);
      readerPage.removeEventListener('controls', toggleControlsOpen);
    }

    fitHeightBtn.removeEventListener('click', onFitHeightClick);
    fitWidthBtn.removeEventListener('click', onFitWidthClick);
    browseBtn.removeEventListener('click', onBrowseClick);
    fullscreenBtn.removeEventListener('click', onFullscreenClick);
    rootNode.removeEventListener('keyup', onKeyUp);
    viewerNode.removeEventListener('transitionend', onViewerTransition);
    browserNode.removeEventListener('transitionend', onBrowserTransition);
    topLeftNavSlot.removeEventListener('slotchange', onTopLeftSlotChange);
    closeBook();
  }
  setTopLeftNav();

  function update(data = {}) {
    if(data.cover) setCover(data.cover);
    if(data.src) setSrc(data.src);
    if(data.page) setPage(data.page - 1);
    if(data.title) setTitle(data.title);
    if(data.controls) setControlsOpen(data.controls);
    return frag;
  }

  update.connect = connect;
  update.disconnect = disconnect;

  return update;
}

const VIEW = Symbol('comic-reader.view');

class ComicReader extends HTMLElement {
  static get observedAttributes() {
    return ['cover', 'page', 'src', 'title', 'controls'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if(!this[VIEW]) {
      let update = this[VIEW] = init.call(this, this.shadowRoot);
      let frag = update({ cover: this._cover, src: this._src, page: this._page,
        title: this._title, backHref: this._backHref, controls: this._controls });
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

  get cover() {
    return this._cover;
  }

  set cover(cover) {
    this._cover = cover;
    if(this[VIEW]) {
      this[VIEW]({ cover });
    }
  }

  get src() {
    return this._src;
  }

  set src(src) {
    this._src = src;
    if(this[VIEW])
      this[VIEW]({ src });
  }

  get page() {
    return this._page;
  }

  set page(page) {
    this._page = page;
    if(this[VIEW])
      this[VIEW]({ page });
  }

  get title() {
    return this._title;
  }

  set title(title) {
    this._title = title;
    if(this[VIEW])
      this[VIEW]({ title });
  }

  get controls() {
    return !!this._controls;
  }

  set controls(value) {
    let controls = this._controls = !!(value === '' ? true : value);
    if(this[VIEW]) {
      this[VIEW]({ controls });
    }
  }
}

customElements.define('comic-reader', ComicReader);

export default ComicReader;