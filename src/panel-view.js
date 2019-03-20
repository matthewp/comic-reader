
function init() {
  /* DOM variables */
  let ctx, imgNode;

  /* State variables */

  /* State update functions */
  function setNodes(nodes) {
    ctx = nodes.ctx;
    imgNode = nodes.imgNode;
  }

  /* Logic functions */
  async function calculatePanels() {
    let { default: jsfeat } = await import('./lib/jsfeat.js');
    
    let w = imgNode.naturalWidth;
    let h = imgNode.naturalHeight;
    let img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
    let imageData = ctx.getImageData(0, 0, w, h);

    let corners = [];
    let i = w*h;
    while(--i >= 0) {
        corners[i] = new jsfeat.keypoint_t(0,0,0,0);
    }
    
    jsfeat.imgproc.grayscale(imageData.data, w, h, img_u8, jsfeat.COLOR_RGBA2GRAY);
    jsfeat.fast_corners.set_threshold(20);
    let count = jsfeat.fast_corners.detect(img_u8, corners, 5);

    console.log("COUNT", count);

    let data_u32 = new Uint32Array(imageData.data.buffer);
    render_corners(corners, count, data_u32, w);

    ctx.putImageData(imageData, 0, 0);

    function render_corners(corners, count, img, step) {
      let pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
      for(i=0; i < count; ++i) {
          let x = corners[i].x;
          let y = corners[i].y;
          let off = (x + y * step);
          img[off] = pix;
          img[off-1] = pix;
          img[off+1] = pix;
          img[off-step] = pix;
          img[off+step] = pix;
      }
    }
  }

  function update(data = {}) {
    if(data.nodes) setNodes(data.nodes);
    return void 0;
  }

  return update;
}

export default init;