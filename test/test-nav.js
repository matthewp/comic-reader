import * as helpers from './helpers.js';

describe('Navigation', function() {
  this.timeout(10000);

  let undo;
  before(async () => {
    undo = await helpers.mount();
  });

  after(() => {
    //undo();
  });

  it('Can navigate to the next page', async () => {
    let p = helpers.waitFor('page');
    helpers.navigate('right');
    let { detail: pageNumber } = await p;
    assert.equal(pageNumber, 2, 'Now on page 2');
  });

  it('Can navigate quickly without losing its spot', async () => {
    function onPage() {
      console.log('Got a page')
    }

    helpers.el().addEventListener('page', onPage);

    let i = 0;
    while(i < 5) {
      helpers.wait(50);
      helpers.navigate('right');
      i++;
    }

    let p = helpers.waitFor('page');
    let { detail: pageNumber } = await p;

    assert.equal(pageNumber, 7, 'now on page 7');

    let page = helpers.currentPage();
    assert.equal(page.dataset.page, "7", "Page 7");
  });
});