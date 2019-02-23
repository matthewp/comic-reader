import * as helpers from './helpers.js';

describe('Navigation', function() {
  this.timeout(10000);

  let undo;
  beforeEach(async () => {
    undo = await helpers.mount();
  });

  afterEach(() => {
    undo();
  });

  it('Can navigate to the next page', async () => {
    let p = helpers.waitFor('page');
    helpers.navigate('right');
    let { detail: pageNumber } = await p;
    assert.equal(pageNumber, 2, 'Now on page 2');
  });

  it('Can navigate quickly without losing its spot', async () => {
    await helpers.navigateTo(5);
    let p = helpers.waitFor('page');
    let { detail: pageNumber } = await p;

    assert.equal(pageNumber, 6, 'now on page 6');

    let page = helpers.currentPage();
    assert.equal(page.dataset.page, "5", "Index 5");
  });

  it('Navigating back stops on the first page', async () => {
    await helpers.navigateTo(2);
    let p = helpers.waitFor('page');
    let { detail: pageNumber } = await p;

    assert.equal(pageNumber, 3, 'Now on page 3');
    await helpers.navigateTo(0);
    await helpers.waitFor('page');

    let page = helpers.currentPage();
    assert.equal(page, page.parentNode.firstElementChild, 'Is the first item');
  });
});