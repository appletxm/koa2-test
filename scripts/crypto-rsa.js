var crypto = require("crypto");
var path = require("path");
var fs = require("fs");
const passphrase = "mySecret"
const { writeFileSync } = require('fs')
const { generateKeyPairSync } = require('crypto')

var encryptStringWithRsaPublicKey = function (toEncrypt, relativeOrAbsolutePathToPublicKey) {
  var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
  var publicKey = fs.readFileSync(absolutePath, "utf8");
  var buffer = new Buffer(toEncrypt);
  var encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
};

var decryptStringWithRsaPrivateKey = function (toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
  var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
  var privateKey = fs.readFileSync(absolutePath, "utf8");
  // var buffer = new Buffer(toDecrypt, "base64");
  var buffer = Buffer.from(toDecrypt, 'base64')
  //var decrypted = crypto.privateDecrypt(privateKey, buffer);
  const decrypted = crypto.privateDecrypt({
      key: privateKey.toString(),
      passphrase: passphrase,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  )

  const realStr = decrypted.toString("utf8")
  console.info('realStr:', realStr)

  return realStr
};

function generateKeys() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    namedCurve: 'secp256k1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: passphrase
    }
  });

  writeFileSync('./crypto-key/private.pem', privateKey)
  writeFileSync('./crypto-key/public.pem', publicKey)
}

module.exports = {
  encryptStringWithRsaPublicKey,
  decryptStringWithRsaPrivateKey,
  generateKeys
}

// generateKeys()
// decryptStringWithRsaPrivateKey('XFKdJhlI3n8p7xpUGyx7GsUPdh1JRBm/bCx4s3ZuTL8fyhMzV7ah/LxkBcguGCvAFDoT6inOXE/TjV/bIHTdDp79VTvB7BSI1bcqjA854j1LUl0OTDuohLhyYEHhMpIJNwIGTro2yFsw14RpgSbVmyFS+Xja7pNTjrUQZ5U+HipW7+CC+MzKeHjrK9zYGHOysWRcnQ6Tg+nkDl9WKYvJo2DV+6KEWqEAs0LoZlg+I6X/dgqOzny7bdjdNHx2hcEhPUbvxw2I4TpJFLRJDcK17IQ6xyCLHw+7Ggp89kgW55AYZppepT/G8T/83w2S1fBn9ykQVZbRpvr7a+5T3PdSz4/+MN/k07GqHQdyQp4SfH/2dmqCsN708L9FTUXVORW1aVVuOT8U26QxAPlQfNx3vCd6/lo4dtWvkKBnycm8RFi2G8Vqsted8FQjmScUn8JhYy83s+oS2AByWH3IdAFxtkMmrDddToGf/8dNhmXidou6hH93wPdhki9d6++y+b4g2ZqIn4OUNtapWhvRHkBZu7Jbm1OKPf8zYLxmF1ffIsB0hvW23WI/YPtjhHQITQhSzJo9WOeEqU6Bm/E9EzUdb2qWB8N0gIvMlKa3/jJoCmCRq3J+RZZwfhBusQ47b8CcggB42BoyCSAYeEFItoBeEiIt/eEnwnmdaZ6hSXhySUY=', './crypto-key/private.pem')
