module.exports = (data) => ({
  createdAt: data.createdat,
  brandId: data.brand_id,
  brantTitle: data.brand_title,
  providerId: data.provider_id,
  providerTitle: data.provider_title,
  uid: data.uid,
  code: data.code,
  article: data.article,
  title: data.title,
  // price: (data.price || 0).toFixed(2),
  price: (data.settlement_price || 0).toFixed(2),
  amount: data.amount || 0,
  amountBovid: data.amount_bovid || 0,
  storage: data.storage,
  weight: (data.weight || 0).toFixed(2),
  width: (data.width || 0).toFixed(2),
  height: (data.height || 0).toFixed(2),
  length: (data.length || 0).toFixed(2),
  manufacturer: data.manufacturer,
});
