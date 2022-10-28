const { expect } = require('chai');

const priceHandler = require('../libs/price.handler');

describe('/test/price.handler.test.js', () => {
  it('simple tests', () => {
    expect(priceHandler('10,5')).equal(10.5);
    expect(priceHandler('10.5')).equal(10.5);
    expect(priceHandler('10')).equal(10);
    expect(priceHandler('10 500,17')).equal(10500.17);
    expect(priceHandler(127.2)).equal(127.2);
    expect(priceHandler('1 206 305,46')).equal(1206305.46);
    expect(priceHandler(null)).equal(0);
    expect(priceHandler(undefined)).equal(0);
    expect(priceHandler(NaN)).equal(0);
  });
});
