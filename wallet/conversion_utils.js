exports.satoshiToBtc = function (amount) {
  return (amount / 100000000).toFixed(8);
};

exports.BtcToSatoshi = function (amount) {
  return (amount * 100000000).toFixed(8);
};
