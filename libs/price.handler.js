module.exports = (price) => {
  if (price) {
    return (+price.toString().replace(',', '.').replace(/[^\d.]/g, '')).toFixed(2);
  }
  return 0;
};
