const crypto = require('crypto')
const fs = require('fs')

function doDecrypto(str) {
  const key = fs.readFileSync('./crypto-key/private_key', {'encoding': 'utf8'})
  const realStr = crypto.privateDecrypt(key, Buffer.from(str, 'utf8'), {padding: crypto.constants.RSA_PKCS1_PADDING})

  return realStr
}

doDecrypto('q2RpjamY4d0vmMtkaw+qVFh3/MtU34HWnyQrzjL0uv4PVmy1aykxWWYLwPk76DcnHHRii8XWEfKrwkNkTBT1VMM=')