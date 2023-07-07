

export let hmacsha256 = (message: string, secret: string) => {
  const CryptoJS = require("crypto-js");
  return CryptoJS.HmacSHA256(message, secret).toString();
};

export let md5 = (message: string) => {
  const CryptoJS = require("crypto-js");
  return CryptoJS.MD5(message);
};
