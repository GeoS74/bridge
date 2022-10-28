module.exports = (price) => {
  if (price) {
    return +price.toString().replace(',', '.').replace(/[^\d.]/g, '');
  }
  return 0;
};
