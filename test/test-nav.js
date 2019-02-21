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
});