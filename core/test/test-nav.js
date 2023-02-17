import * as helpers from './helpers.js';

QUnit.module('Navigation', hooks => {
  let undo;
  hooks.beforeEach(async () => {
    undo = await helpers.mount();
  });

  hooks.afterEach(() => {
    undo();
  });

  QUnit.test('Can navigate to the next page', async assert => {
    let p = helpers.waitFor('page');
    helpers.navigate('right');
    let { detail: pageNumber } = await p;
    assert.equal(pageNumber, 2, 'Now on page 2');
  });

  QUnit.test('Can navigate quickly without losing its spot', async assert => {
    await helpers.navigateTo(5);
    let p = helpers.waitFor('page');
    let { detail: pageNumber } = await p;

    assert.equal(pageNumber, 6, 'now on page 6');

    let page = helpers.currentPage();
    assert.equal(page.dataset.page, "5", "Index 5");
  });

  QUnit.test('Navigating back stops on the first page', async assert => {
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
