module.exports = (name) => {
  let numberColumn = 0;

  if (!name) {
    return numberColumn;
  }

  const columnName = name.toString().match(/[a-z]/ig)?.reverse().join('')
    .toLowerCase();

  if (columnName) {
    for (let i = 0; i < columnName.length; i += 1) {
      if (range[columnName[i]]) {
        numberColumn += 26 ** i * range[columnName[i]];
      }
    }
  }
  return numberColumn;
};

const range = _getLettersRange();

function _getLettersRange() {
  const obj = {};
  for (let i = 97; i < 123; i += 1) { // 97-122
    obj[String.fromCharCode(i)] = i - 96;
  }
  return obj;
}
