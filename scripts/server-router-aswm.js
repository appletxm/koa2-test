const fs = require('fs')
const path = require('path')

function getWsamFile (req, res) {
  let scriptFilePath = path.join(__dirname, '..' + req.originalUrl)
  let script = fs.readFileSync(scriptFilePath)

  console.log('scriptFilePath:', scriptFilePath)

  res.set('content-type', 'application/wasm')
  res.send(script)
  res.end()
}

function assignRouter (req, res, next) {
  console.info('[wasm http get]', req.baseUrl, req.originalUrl)

  if ((/^.+\.(wasm|wat)$/).test(req.originalUrl)) {
    getWsamFile(req, res)
  }

  if (next && typeof next === 'function') {
    next()
  }
}

module.exports = assignRouter
