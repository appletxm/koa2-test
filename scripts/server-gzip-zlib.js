const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function gzip(sourcePath) {
  // let sourcePath = path.join(__dirname, source);
  let gzipPath = `${sourcePath}.gz`;

  let gzip = zlib.createGzip();
  let rs = fs.createReadStream(sourcePath);
  let ws = fs.createWriteStream(gzipPath);

  rs.pipe(gzip).pipe(ws);

  return rs
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
