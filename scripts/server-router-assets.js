const fs = require('fs')
const path = require('path')
const getContentType = require('./server-get-content-type')
const excelOpts = require('./excel-opts')
const { cacheControl } = require('./server-cache-control')
const serverAccessControl = require('./server-access-control')
const { gzip } = require('./server-gzip-zlib')

function getImageFile (req, res) {
  let filename = path.join(__dirname, ('..' + req.originalUrl))
  let fileType = (req.originalUrl).match(/.+\.(.+)/)

  let file = fs.readFileSync(filename)
  let contentType = getContentType(fileType[1])

  res.set('Content-Type', contentType)
  res.send(file)
  res.end()
}

function getHtmlFile (req, res) {
  let url = req.originalUrl === '/' ? '../index.html' : ('../' + (req.originalUrl.replace(/\?.+$/, '')))
  let htmlFilePath = path.join(__dirname, url)
  let html = fs.readFileSync(htmlFilePath)
  let contentType = getContentType('html')

  res.set('Content-Type', contentType)
  res.send(html)
  res.end()
}

function getScriptFile (req, res) {
  let scriptFilePath = path.join(__dirname, '..' + (req.originalUrl.replace(/\?.+$/, '')))
  let script = fs.readFileSync(scriptFilePath)
  let contentType = getContentType('js')

  res.set('Content-Type', contentType)
  res.send(script)
  res.end()

  // let scriptFilePath = path.join(__dirname, '..' + req.originalUrl)
  // // let stats = fs.statSync(scriptFilePath)
  // res.set('Content-Type', getContentType('js'))
  // // res.set('Content-Length', (stats.size / 1000) + 'kb')

  // const stream = gzip(scriptFilePath)
  // stream.pipe(res)
}

function getCssFile (req, res) {
  let filePath = path.join(__dirname, '../' + (req.originalUrl.replace(/\?.+$/, '')))
  let file = fs.readFileSync(filePath)
  let contentType = getContentType('css')

  res.set('Content-Type', contentType)
  res.send(file)
  res.end()
}

function getPdfFile (req, res) {
  let filePath = decodeURIComponent(path.join(__dirname, '../' + (req.originalUrl.replace(/\?.+$/, ''))))
  let file = fs.readFileSync(filePath)
  let contentType = getContentType('pdf')

  res.set('Content-Type', contentType)
  res.send(file)
  res.end()
}

function resRage(file, req, res, contentType) {
  var range = req.headers.range
  var total = file.length
  var split = range.split(/[-=]/)
  var ini = +split[1]
  var end = split[2]? +split[2] : total-1
  var chunkSize = end - ini + 1
  if (parseInt(ini) >= total || parseInt(end) >= total) {
    //Indicate the acceptable range.
    res.status(416)
    res.set("Content-Range",'bytes */' + total) // File size.
    //Return the 416 'Requested Range Not Satisfiable'.
      res.end()
  }
  res.status(206)
  res.set('Connection', 'keep-alive')
  res.set("Content-Range","bytes " + ini + "-" + end + "/" + total)
  res.set("Accept-Ranges", "bytes")
  res.set("Content-Length", chunkSize)
  res.set("Content-Type", contentType)
  res.end(file.slice(ini, chunkSize+ini))

  // res.status(206);
  // res.set('Connection', 'keep-alive');
  // res.set("Content-Range","bytes " + ini + "-" + end + "/" + total);
  // res.set("Accept-Ranges", "bytes");
  // res.set("Content-Length", chunkSize);
  // res.set("Content-Type", contentType);
  // fs.createReadStream(filename, { start: ini, end: end }).pipe(res)
}

function getMp4File (req, res) {
  let filePath = decodeURIComponent(path.join(__dirname, '../' + req.originalUrl))
  let file = fs.readFileSync(filePath)
  let contentType = getContentType('mp4')

  res.set('Content-Type', contentType)
  if (req.headers.range) {
    resRage(file, req, res, contentType)
  } else {
    res.send(file)
    res.end()
  }
}

function getExcelFile (req, res) {
  excelOpts.downLoadExcel(req, res)
}

function routerAssets (req, res, logger) {
  console.info('[http get]', req.baseUrl, req.originalUrl)
  logger.info('[http get]', req.baseUrl, req.originalUrl)

  serverAccessControl(res)
  cacheControl(res)

  // if (req.originalUrl.indexOf('assets/images') >= 0) {
  if ((/^.+\.(png|jpg|jpeg|gif|ico)$/).test(req.originalUrl)) {
    getImageFile(req, res)
  } else if (req.originalUrl.indexOf('.js') >= 0) {
    getScriptFile(req, res)
  } else if (req.originalUrl.indexOf('.css') >= 0) {
    getCssFile(req, res)
  } else if (req.originalUrl.indexOf('.html') >= 0 || req.originalUrl.indexOf('.htm') >= 0) {
    getHtmlFile(req, res)
  } else if (req.originalUrl.indexOf('.pdf') >= 0) {
    getPdfFile(req, res)
  } else if(req.originalUrl.indexOf('download-excel') >= 0) {
    getExcelFile(req, res)
  } else if (req.originalUrl.indexOf('.mp4') >= 0) {
    getMp4File(req, res)
  } else {
    getHtmlFile(req, res)
  }

  // if (next && typeof next === 'function') {
  //   next()
  // }
}

module.exports = routerAssets
