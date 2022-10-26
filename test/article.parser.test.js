const { expect } = require('chai');

const dictionary = require('../dictionary/russian.symbol.json');
const articleParser = require('../libs/article.parser');

describe('/test/article.parser.test.js', () => {
  it('parsing string', () => {
    expect(articleParser('4320ЯX-1201010 01')).equal('0100 1201010 4320yax');
    expect(articleParser(NaN)).equal('');
    expect(articleParser(null)).equal('');
    expect(articleParser(undefined)).equal('');
    expect(articleParser(' ')).equal('');
    expect(articleParser('')).equal('');
    expect(articleParser(' 1 ')).equal('1000');
  });
  it('check dictionary', () => {
    expect(dictionary['а']).equal('a');
    expect(dictionary['б']).equal('s');
    expect(dictionary['в']).equal('b');
    expect(dictionary['г']).equal('g');
    expect(dictionary['д']).equal('d');
    expect(dictionary['е']).equal('e');
    expect(dictionary['ж']).equal('j');
    expect(dictionary['з']).equal('z');
    expect(dictionary['и']).equal('i');
    expect(dictionary['й']).equal('y');

    expect(dictionary['к']).equal('k');
    expect(dictionary['л']).equal('l');
    expect(dictionary['м']).equal('m');
    expect(dictionary['н']).equal('h');
    expect(dictionary['о']).equal('o');
    expect(dictionary['п']).equal('n');
    expect(dictionary['р']).equal('p');
    expect(dictionary['с']).equal('c');
    expect(dictionary['т']).equal('t');
    expect(dictionary['у']).equal('u');

    expect(dictionary['ф']).equal('f');
    expect(dictionary['х']).equal('x');
    expect(dictionary['ц']).equal('v');
    expect(dictionary['ы']).equal('r');
    expect(dictionary['э']).equal('eu');

    expect(dictionary['ё']).equal('yo');
    expect(dictionary['ч']).equal('w');
    expect(dictionary['ш']).equal('sh');
    expect(dictionary['щ']).equal('sch');
    expect(dictionary['ъ']).equal('q');
    expect(dictionary['ь']).equal('qu');
    expect(dictionary['ю']).equal('yu');
    expect(dictionary['я']).equal('ya');
  });
});
