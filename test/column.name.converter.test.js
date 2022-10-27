const { expect } = require('chai');

const converter = require('../libs/column.name.converter');

describe('/test/column.name.converter.test.js', () => {
  it('simple tests', () => {
    expect(converter('A')).equal(1);
    expect(converter('aB')).equal(28);
    expect(converter('bCd')).equal(1434);
    expect(converter(1)).equal(0);
    expect(converter('12')).equal(0);
    expect(converter('a1a')).equal(27);
    expect(converter('1ab')).equal(28);
    expect(converter(null)).equal(0);
    expect(converter(undefined)).equal(0);
    expect(converter(NaN)).equal(0);
  });
});
