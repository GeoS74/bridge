const { expect } = require('chai');

const { convStringToReal, convRealToString } = require('../libs/price.handler');

describe('/test/price.handler.test.js', () => {
  it('string to real', () => {
    expect(convStringToReal('10,5')).equal(10.50.toFixed(2));
    expect(convStringToReal('10.5')).equal(10.5.toFixed(2));
    expect(convStringToReal('10')).equal(10.0.toFixed(2));
    expect(convStringToReal('10 500,17')).equal(10500.17.toFixed(2));
    expect(convStringToReal(127.2)).equal(127.2.toFixed(2));
    expect(convStringToReal('1 206 305,467')).equal(1206305.47.toFixed(2));
    expect(convStringToReal(null)).equal(0);
    expect(convStringToReal(undefined)).equal(0);
    expect(convStringToReal(NaN)).equal(0);
  });
  it('real to string', () => {
    expect(convRealToString('10,5')).equal('NaN');
    expect(convRealToString('10.5')).equal('10,50');
    expect(convRealToString('10.50123')).equal('10,50');
    expect(convRealToString(null)).equal(0);
    expect(convRealToString(undefined)).equal(0);
    expect(convRealToString(NaN)).equal(0);
  });
});
