const translit = require('./translitter');

module.exports = (word) => {
  if (!word) {
    return '';
  }
  return _parseToArrayEng(translit(word))
    .join(' ')
    .replaceAll(/[\s-]+/g, '_');
};

function _parseToArrayEng(word) {
  return word.match(/[a-z\d-]+/g) || [];
}
