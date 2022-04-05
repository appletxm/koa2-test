const fs = require('fs')
const path = require('path')

function getImageFile (req, res) {
  let url = req.baseUrl || req.originalUrl
  let filename = path.join(__dirname, ('..' + url))
  let fileType = (url).match(/.+\.(.+)/)
  let file = fs.readFileSync(filename)

  res.set('content-type', 'image/' + fileType[1])
  res.send(file)
  res.end()
}

function getHtmlFile (req, res) {
  // let htmlFilePath = path.join(__dirname, '../index.html')
  // let html = fs.readFileSync(htmlFilePath)

  let url = req.originalUrl.replace(/\?.+$/, '')

  console.info('===url===', url)

  let filename = url === '/' ? '../index.html'  : url
  filename = path.join(__dirname, '..' + url)
  let html = fs.readFileSync(filename)

  res.set('content-type', 'text/html')
  res.send(html)
  res.end()
}

function getScriptFile (req, res) {
  let scriptFilePath = path.join(__dirname, '..' + req.originalUrl)
  let script = fs.readFileSync(scriptFilePath)

  res.set('content-type', 'application/x-javascript')
  res.send(script)
  res.end()
}

function getCssFile (req, res) {
  let fileName = path.join(__dirname, '..' + req.originalUrl)
  fs.readFile(fileName, function (err, result) {
    if (err) {
      res.send(err)
    } else {
      res.set('content-type', '	text/css')
      res.send(result)
    }
    res.end()

    if (next) {
      next()
    }
  })
}

function assignRouter (req, res, next) {
  console.info('[http get]', req.baseUrl, req.originalUrl)
  if (req.originalUrl.indexOf('assets/images') >= 0 || (/^.+\.jpg|png|gif|jpeg]$/).test(req, originalUrl)) {
    getImageFile(req, res)
  } else if (req.originalUrl.indexOf('.js') >= 0) {
    getScriptFile(req, res)
  } else if (req.originalUrl.indexOf('.css') >= 0) {
    getCssFile(req, res)
  } else if (req.originalUrl.indexOf('.html') >= 0 || req.originalUrl.indexOf('.htm') >= 0) {
    getHtmlFile(req, res)
  } else {
    getHtmlFile(req, res)
  }

  if (next && typeof next === 'function') {
    next()
  }
}

module.exports = assignRouter
