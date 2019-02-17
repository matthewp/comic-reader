function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function init(canvasNode) {
  /* DOM variables */
  let ctx = canvasNode.getContext('2d');
  let imgNode = document.createElement('img');

  /* DOM update functions */
  function setImgNode(value) {
    imgNode.src = value;
  }

  async function setCanvasURL(url) {
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
        img.onload = function() {
          resolve(img);
        };
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
    canvasNode.dispatchEvent(ev);
  }

  function dispatchNavNext() {
    let ev = new CustomEvent('nav-next');
    canvasNode.dispatchEvent(ev);
  }

  function dispatchControls() {
    let ev = new CustomEvent('controls');
    canvasNode.dispatchEvent(ev);
  }

  /* Event listeners */
  function onImgDlbClick(ev) {
    let w = imgNode.naturalWidth;
    let h = w / 2;
    if(ev.offsetX < h) {
      dispatchNavPrevious();
    } else {
      dispatchNavNext();
    }
  }

  function onImgClick(ev) {
    switch(getClickPosition(ev)) {
      case 0:
      case 2:
        break;
      case 1:
        dispatchControls();
        break;
    }
  }

  /* Init functionality */
  function connect() {
    canvasNode.addEventListener('click', onImgClick);
    canvasNode.addEventListener('dblclick', onImgDlbClick);
  }

  function disconnect() {
    canvasNode.removeEventListener('click', onImgClick);
    canvasNode.removeEventListener('dblclick', onImgClick);
  }

  function update(data = {}) {
    if(data.url) return setCanvasURL(data.url);
    return canvasNode;
  }

  update.connect = connect;
  update.disconnect = disconnect;

  return update;
}

export default init;