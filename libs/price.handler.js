module.exports.convStringToReal = (price) => {
  if (price) {
    return (+price.toString().replace(',', '.').replace(/[^\d.]/g, '')).toFixed(2);
  }
  return 0;
};
module.exports.convRealToString = (price) => {
  if (price) {
    return ((+price).toFixed(2).toString().replace('.', ','));
  }
  return 0;
};
