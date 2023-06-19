const transliteRusSymbol = require('../dictionary/translite.russian.symbol.json');

module.exports = (word) => {
  if (!word) {
    return '';
  }
  return _translitToEng(word.toString().toLowerCase().trim());
};

function _translitToEng(word) {
  let result = '';
  for (let i = 0; i < word.length; i += 1) {
    result += transliteRusSymbol[word[i]] || word[i];
  }
  return result;
}
