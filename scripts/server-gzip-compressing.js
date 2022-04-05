const compressing = require("compressing");
const fs = require("fs");
const path = require("path");

function gzip(sourcePath) {
  // let sourcePath = path.join(__dirname, source);
  let gzipPath = `${sourcePath}.gz`;
  let resolveCb = null
  let rejectCb = null
  const promise = new Promise((resolve, reject) => {
    resolveCb = resolve
    rejectCb = reject
  })

  // const stream = fs.createReadStream(sourcePath)

  compressing.gzip.compressFile(sourcePath, gzipPath).then(() => {
    resolveCb(true)
  }).catch(handleError => {
    rejectCb('transform file to gizp fail')
  });

  return promise
}

function ungzip(source) {
  let sourcePath = path.join(__dirname, source);
  let filePath = path.join(__dirname, path.basename(source, ".gz"));

  let unzip = zlib.createGunzip();
  let rs = createReadStream(sourcePath);
  let ws = createWriteStream(filePath);

  rs.pipe(unzip).pipe(ws);
}

module.exports = {
  gzip,
  ungzip
}
