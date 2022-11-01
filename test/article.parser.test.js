const { expect } = require('chai');

const rusSymbol = require('../dictionary/russian.symbol.json');
const engSymbol = require('../dictionary/english.symbol.json');
const { parserEng, parserRus, parserGlue } = require('../libs/article.parser');

describe('/test/article.parser.test.js', () => {
  it('parserEng tests', () => {
    expect(parserEng('4320ЯX-1201010 01')).equal('0100 1201010 4320yax');
    expect(parserEng(NaN)).equal('');
    expect(parserEng(null)).equal('');
    expect(parserEng(undefined)).equal('');
    expect(parserEng(' ')).equal('');
    expect(parserEng('')).equal('');
    expect(parserEng(' 1 ')).equal('1000');
  });
  it('parserRus tests', () => {
    expect(parserRus('4320ЯX-1201010 01')).equal('0100 1201010 4320ях');
    expect(parserRus(NaN)).equal('');
    expect(parserRus(null)).equal('');
    expect(parserRus(undefined)).equal('');
    expect(parserRus(' ')).equal('');
    expect(parserRus('')).equal('');
    expect(parserRus(' 1 ')).equal('1000');
  });
  it('parserGlue tests', () => {
    expect(parserGlue('4320ЯX-1201010 01')).equal('4320yax120101001');
    expect(parserGlue(NaN)).equal('');
    expect(parserGlue(null)).equal('');
    expect(parserGlue(undefined)).equal('');
    expect(parserGlue(' ')).equal('');
    expect(parserGlue('')).equal('');
    expect(parserGlue(' 1 2')).equal('12');
  });
  it('check dictionary russian.symbol', () => {
    expect(rusSymbol['а']).equal('a');
    expect(rusSymbol['б']).equal('s');
    expect(rusSymbol['в']).equal('b');
    expect(rusSymbol['г']).equal('g');
    expect(rusSymbol['д']).equal('d');
    expect(rusSymbol['е']).equal('e');
    expect(rusSymbol['ж']).equal('j');
    expect(rusSymbol['з']).equal('z');
    expect(rusSymbol['и']).equal('i');
    expect(rusSymbol['й']).equal('y');

    expect(rusSymbol['к']).equal('k');
    expect(rusSymbol['л']).equal('l');
    expect(rusSymbol['м']).equal('m');
    expect(rusSymbol['н']).equal('h');
    expect(rusSymbol['о']).equal('o');
    expect(rusSymbol['п']).equal('n');
    expect(rusSymbol['р']).equal('p');
    expect(rusSymbol['с']).equal('c');
    expect(rusSymbol['т']).equal('t');
    expect(rusSymbol['у']).equal('u');

    expect(rusSymbol['ф']).equal('f');
    expect(rusSymbol['х']).equal('x');
    expect(rusSymbol['ц']).equal('v');
    expect(rusSymbol['ы']).equal('r');
    expect(rusSymbol['э']).equal('eu');

    expect(rusSymbol['ё']).equal('yo');
    expect(rusSymbol['ч']).equal('w');
    expect(rusSymbol['ш']).equal('sh');
    expect(rusSymbol['щ']).equal('sch');
    expect(rusSymbol['ъ']).equal('q');
    expect(rusSymbol['ь']).equal('qu');
    expect(rusSymbol['ю']).equal('yu');
    expect(rusSymbol['я']).equal('ya');
  });
  it('check dictionary english.symbol', () => {
    expect(engSymbol.a).equal('а');
    expect(engSymbol.b).equal('в');
    expect(engSymbol.e).equal('е');
    expect(engSymbol.k).equal('к');
    expect(engSymbol.m).equal('м');
    expect(engSymbol.h).equal('н');
    expect(engSymbol.o).equal('о');
    expect(engSymbol.p).equal('р');
    expect(engSymbol.c).equal('с');
    expect(engSymbol.t).equal('т');
    expect(engSymbol.x).equal('х');
  });
});
