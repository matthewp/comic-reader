let pageView;

{
  const template = document.createElement('template');
  template.innerHTML = /* html */ `
    <li>
      <button type="button">
        <figure>
          <img />
          <figcaption></figcaption>
        </figure>
      </button>
    </li>
  `;

  function clone() {
    return document.importNode(template.content, true);
  }

  function init() {
    /* DOM variables */
    let frag = clone();
    let liNode = frag.querySelector('li');
    let btn = frag.querySelector('button');
    let imgNode = frag.querySelector('img');
    let captionNode = frag.querySelector('figcaption');

    /* State variables */
    let url, page, onPageSelect, current = false;

    /* DOM update functions */
    function setLiCurrent() {
      liNode.classList[current ? 'add' : 'remove']('current');
    }

    function setImgSrc() {
      imgNode.src = url;
    }

    function setImgAlt(value) {
      imgNode.setAttribute('alt', value);
    }

    function setCaption(value) {
      captionNode.textContent = value;
    }

    function setBtnData(value) {
      btn.dataset.page = value;
    }

    /* State update functions */
    function setUrl(value) {
      if(value !== url) {
        url = value;
        setImgSrc();
      }
    }

    function setPage(value) {
      if(value !== page) {
        page = value;
        setCaption(page);
        setImgAlt(`Page ${page}`);
        setBtnData(page);
      }
    }

    function setCurrent(value) {
      if(value !== current) {
        current = value;
        setLiCurrent();
      }
    }

    function setOnPageSelect(value) {
      if(value !== onPageSelect) {
        onPageSelect = value;
        btn.addEventListener('click', onPageSelect);
      }
    }

    /* Initialization */
    function disconnect() {
      btn.removeEventListener('click', onPageSelect);
    }

    function update(data = {}) {
      if(data.current != null) setCurrent(data.current);
      if(data.page) setPage(data.page);
      if(data.url) setUrl(data.url);
      if(data.onPageSelect) setOnPageSelect(data.onPageSelect);
      return frag;
    }

    update.disconnect = disconnect;

    return update;
  }

  pageView = init;
}

const template = document.createElement('template');
template.innerHTML = /* html */ `
  <style>
    .browser .pages {
      color: var(--white);
      overflow: scroll;
      height: 100%;
    }

    .browser ul {
      margin-top: 4rem;
      display: grid;
      grid-template-columns: repeat(4, minmax(50px, 1fr));
      list-style-type: none;
      padding: 0;
    }

    .browser .current figure {
      background: #0078f0;
    }

    .browser ul button {
      background: transparent;
      border: none;
      padding: 0;
      font: inherit;
      color: inherit;
    }

    .browser figure {
      text-align: center;
      margin: 0;
      padding: 10px;
    }

    .browser ul img {
      max-width: 100%;
    }
  </style>
  <div class="pages"><ul></ul></div>
`;

function clone() {
  return document.importNode(template.content, true);
}

function init(root) {
  /* DOM variables */
  let frag = clone();
  let listNode = frag.querySelector('ul');
  let closeBtn = root.querySelector('#close-browser');

  /* DOM views */
  let pages = [];

  /* State variables */
  let source, currentPage, setPage;

  /* DOM update functions */
  function addPages() {
    let len = source.getLength();
    for(let i = 0; i < len; i++) {
      let update = pageView();
      listNode.appendChild(update());
      pages.push(update);
    }
  }

  function teardownPages() {
    for(let update of pages) {
      update.disconnect();
    }
  }

  async function updatePages() {
    let len = source.getLength(), i = 0;
    while(len > i) {
      let url = await source.item(i);
      let update = pages[i];
      update({ page: i + 1, url, current: i === currentPage, onPageSelect });
      i++;
    }
  }

  function setBrowserClose() {
    root.classList.remove('open');
  }

  /* State update functions */
  function setSource(value) {
    if(value !== source) {
      source = value;
      teardownPages();
      addPages();
      updatePages();
    }
  }

  function setCurrentPage(value) {
    if(value !== currentPage) {
      currentPage = value;
      if(source) {
        updatePages();
      }
    }
  }

  function setSetPage(value) {
    if(value !== setPage) {
      setPage = value;
    }
  }

  /* Event listeners */
  function onCloseClick() {
    setBrowserClose();
  }

  function onPageSelect(ev) {
    let page = Number(ev.currentTarget.dataset.page) - 1;
    setPage(page);
    requestIdleCallback(() => {
      setBrowserClose();
    });
  }

  /* Initialization */
  root.appendChild(frag);
  closeBtn.addEventListener('click', onCloseClick);

  function disconnect() {
    closeBtn.removeEventListener('click', onCloseClick);
  }

  function update(data = {}) {
    if(data.setPage) setSetPage(data.setPage);
    if(data.currentPage != null) setCurrentPage(data.currentPage);
    if(data.source) {
      requestIdleCallback(() => setSource(data.source));
    }
  }

  update.disconnect = disconnect;

  return update;
}

export default init;