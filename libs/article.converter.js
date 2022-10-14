const dictionary = require('../dictionary/russian.symbol.json');

module.exports = (word) => {
  word = _translit(word.toLowerCase().trim());
  return _parseToArray(word).sort().join('');
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
