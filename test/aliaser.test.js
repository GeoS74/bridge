const { expect } = require('chai');

const aliaser = require('../libs/aliaser');

describe('/test/aliaser.test.js', () => {
  it('word to alias', () => {
    expect(aliaser('10,5 пример')).equal('10_5_primer');
    expect(aliaser('     10,5         пример     ')).equal('10_5_primer');
  });
});
