const { expect } = require('chai');

const priceHandler = require('../libs/price.handler');

describe('/test/price.handler.test.js', () => {
  it('simple tests', () => {
    expect(priceHandler('10,5')).equal(10.50.toFixed(2));
    expect(priceHandler('10.5')).equal(10.5.toFixed(2));
    expect(priceHandler('10')).equal(10.0.toFixed(2));
    expect(priceHandler('10 500,17')).equal(10500.17.toFixed(2));
    expect(priceHandler(127.2)).equal(127.2.toFixed(2));
    expect(priceHandler('1 206 305,467')).equal(1206305.47.toFixed(2));
    expect(priceHandler(null)).equal(0);
    expect(priceHandler(undefined)).equal(0);
    expect(priceHandler(NaN)).equal(0);
  });
});
