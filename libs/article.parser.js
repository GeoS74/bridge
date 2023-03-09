const rusSymbol = require('../dictionary/russian.symbol.json');
const engSymbol = require('../dictionary/english.symbol.json');

module.exports.parserEng = (word) => {
  if (!word) {
    return '';
  }
  word = _translitToEng(word.toString().toLowerCase().trim());
  return _parseToArrayEng(word)
    .sort()
    // .map((e) => (e.length < 4 ? e + new Array(4 - e.length).fill('0').join('') : e))
    .join(' ');
};

function _parseToArrayEng(word) {
  return word.match(/[a-z\d]+/g) || [];
}

function _translitToEng(word) {
  let result = '';
  for (let i = 0; i < word.length; i += 1) {
    result += rusSymbol[word[i]] || word[i];
  }
  return result;
}

module.exports.parserRus = (word) => {
  if (!word) {
    return '';
  }
  word = _translitToRus(word.toString().toLowerCase().trim());
  return _parseToArrayRus(word)
    .sort()
    // .map((e) => (e.length < 4 ? e + new Array(4 - e.length).fill('0').join('') : e))
    .join(' ');
};

function _parseToArrayRus(word) {
  return word.match(/[a-zа-я\d]+/g) || [];
}

function _translitToRus(word) {
  let result = '';
  for (let i = 0; i < word.length; i += 1) {
    result += engSymbol[word[i]] || word[i];
  }
  return result;
}

module.exports.parserGlue = (word) => {
  if (!word) {
    return '';
  }
  word = _translitToEng(word.toString().toLowerCase().trim());
  return _parseToArrayEng(word).join('');
};
