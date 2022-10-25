const dictionary = require('../dictionary/russian.symbol.json');

module.exports = (word) => {
  if(!word) {
    return '';
  }
  word = _translit(word.toString().toLowerCase().trim());
  return _parseToArray(word)
    .sort()
    .map(e => e.length < 4 ? e + new Array(4-e.length).fill('0').join('') : e)
    .join(' ');
};

function _parseToArray(word) {
  return word.match(/[a-z\d]+/g) || [];
}

function _translit(word) {
  let result = '';
  for (let i = 0; i < word.length; i += 1) {
    result += dictionary[word[i]] || word[i];
  }
  return result;
}
