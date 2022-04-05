const fs = require('fs')
const path = require('path')
const getContentType = require('./server-get-content-type')

function getFileSize(filePath, needChange) {
  var stats = fs.statSync(filePath)
  var fileSizeInBytes = stats['size']

  console.info('****bytes***', fileSizeInBytes)

  //Convert the file size to megabytes (optional)
  if (needChange === true) {
    fileSizeInBytes = fileSizeInBytes / 1000000.0
  }
  return fileSizeInBytes
}

function getMockFiles (req, res) {
  let filePath
  let file
  let parseFile

  try {
    filePath = path.resolve(__dirname, '../mocks/' + req['originalUrl'].replace(/\?.*/, '') + '.json')
    console.log(`[HTTP GET MOCK FILE] `, filePath)
    file = fs.readFileSync(filePath, {encoding: 'utf-8'})
    parseFile = file ? JSON.parse(file) : {}
    // parseFile.code = '200'
    // parseFile.msg = 'Get data success'
    res.cookie('onlyItem', '123456789', { maxAge: 60000, httpOnly: true })
    res.cookie('sessionItem', '778899')
    res.cookie('showItem', 'abcdefg', { maxAge: 60000, sameSite: false })
  } catch(e) {
    parseFile = {}
    parseFile.code = '999'
    parseFile.msg = 'Fail to get data'
  }
  parseFile = JSON.stringify(parseFile)

  res.set({
    'Content-Type': 'application/json;charset=UTF-8',
    'Content-Length': parseFile.length
  })
  res.send(parseFile)
  res.end()
}

function getBinaryData (req, res) {
  const filePath = path.resolve('./assets/books/数据结构与算法JavaScript描述.pdf')
  const fileSize = getFileSize(filePath, false)

  // console.info('****mb***', fileSize)

  res.set({
    'Content-Length': fileSize,
    'Content-Disposition': 'attachment; filename=' + encodeURIComponent('数据结构与算法JavaScript描述.pdf'),
    'Content-Type': 'application/octet-stream'
  })

  const stream = fs.createReadStream(filePath)
  stream.pipe(res)

  // const file = fs.readFileSync(filePath)
  // console.info('====file:', file.length)
  // res.set({
  //   'Content-Disposition': 'attachment; filename=' + encodeURIComponent('前端.zip'),
  //   'Content-Type': 'application/octet-stream',
  //   'Content-Length': file.length
  // })
  // res.send(file)
  // res.end()
}

function getBinaryDataForDownload(req, res) {
  const filePath = path.resolve('./uploads/订单列表-20190410144008.xlsx')
  // fs.createReadStream(filePath).pipe(res)
  const file = fs.readFileSync(filePath)
  console.info('====file:', file.length)
  res.set({
    'Content-Disposition': 'attachment; filename=' + encodeURIComponent('订单列表-20190410144008.xlsx'),
    'Content-Type': 'application/octet-stream',
    'Content-Length': file.length
  })
  res.send(file)
  res.end()
}

function getBinaryPicData(req, res) {
  const filePath = path.resolve('./assets/images/bg.jpg')
  fs.createReadStream(filePath).pipe(res)
}

function getVideoFiles(req, res) {
  // // let filePath
  // let file
  // let parseFile

  // try {
  //   filePath = path.resolve(__dirname, '../mocks/' + req['originalUrl'] + ((/^\/.+$/).test(req['path']) ? req['path'] : '') + '.json')
  //   console.log(`[HTTP GET MOCK FILE] `, filePath)
  //   file = fs.readFileSync(filePath, {encoding: 'utf-8'})
  //   parseFile = file
  //   res.set({
  //     'Content-Type': 'text/plain;charset=UTF-8',
  //     'Content-Length': parseFile.length
  //   })
  //   res.status(200)
  // } catch(e) {
  //   parseFile = {}
  //   parseFile.code = '999'
  //   parseFile.msg = 'Fail to get data'
  //   res.set({
  //     'Content-Type': 'application/json;charset=UTF-8',
  //     'Content-Length': parseFile.length
  //   })
  //   parseFile = JSON.stringify(parseFile)
  // }
  // res.send(parseFile)
  // res.end()

  let contentType = ''
  const matchedObj = req.originalUrl.match(/\.([^\.\/\?\&]+)/)
  if (matchedObj[1]) {
    contentType = getContentType(matchedObj[1])
  } else {
    contentType = 'video/mp4'
  }
  console.info('******contentType: ', contentType)

  // let filePath = './assets/videos/SampleVideo_1280x720_5mb.mp4'
  const fileBasePath = req.originalUrl.replace(/\?.+$/, '')
  const filePath = path.resolve('./' + fileBasePath.replace(/\//, ''))
  console.info('******media file path: ', filePath)

  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const range = req.headers.range
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10): fileSize-1
  
    const chunksize = (end-start)+1
    const file = fs.createReadStream(filePath, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    }
  
    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    }
    res.writeHead(200, head)
    fs.createReadStream(filePath).pipe(res)
  }
}

function getAjaxGet (req, res) {
  let params

  if(!req['query'] ){
    params = decodeURIComponent((req['_parsedUrl']['query'].match(/params=(.+)/))[1])
    params = JSON.parse(params)
  } else {
    params = req.query
  }

  if (req.originalUrl.indexOf('videos') >= 0 || req.originalUrl.indexOf('uploads') >= 0) {
    getVideoFiles(req, res)
  } else if (req.originalUrl.indexOf('download-pdf') >= 0) {
    getBinaryData(req, res)
  } else if(req.originalUrl.indexOf('download-excel') >= 0) {
    getBinaryDataForDownload(req, res)
  } else if (req.originalUrl.indexOf('getBinaryPicData') >= 0) {
    getBinaryPicData(req, res)
  } else {
    getMockFiles(req, res)
  }
}

function getParamsFromForm (body) {
  let keysValues = body.match(/([^&=]+)=([^&=]*)/g)
  let params = {}

  // console.info(body, keysValues)

  keysValues && keysValues.forEach(keyValue => {
    let splitObj = keyValue.split('=')
    let key = splitObj[0]
    params[key] = decodeURIComponent(splitObj[1])
  })

  return params
}

function handleMultipartDataForm (req, res, cb) {
  let formidable = require('formidable')
  let form = new formidable.IncomingForm()

  // form.uploadDir = path.resolve(__dirname, '../tmp/')
  form.uploadDir = './tmp/'
  form.keepExtensions = false
  form.maxFieldsSize = 2 * 1024 * 1024 // 为2MB

  form.on('progress', (bytesReceived, bytesExpected) => {
    console.info('##progress###', bytesReceived, bytesExpected)
  })

  form.on('field', (name, value) => {
    console.info('##field###', name, value)
  })

  form.on('fileBegin', (name, file) => {
    console.info('##fileBegin###', name, file)
  })

  form.on('file', (name, file) => {
    console.info('##file###', name, file)
  })

  form.on('end', () => {
    console.info('##end###')
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      // Check for and handle any errors here.
      console.error(err.message)
      return
    } else {
      console.info({fields: fields, files: files})
    }
  })
}

function handlePureFileUpload(body, req, res) {
  let filePath = path.resolve(__dirname, '../uploads/' + decodeURIComponent(req.query.name).toLowerCase())

  // fs.openSync(filePath, 'w+')
  fs.writeFileSync(filePath, body)

  res.send({
    code: '200',
    msg: 'pure file upload success'
  })
}

function getAjaxPost (req, res) {
  let body = ''
  let params
  let isWWWreq = (req['headers']['content-type']).indexOf('application/x-www-form-urlencoded') >= 0
  let isJsonReq = (req['headers']['content-type']).indexOf('application/json') >= 0
  let isMultipartFormReq = (req['headers']['content-type']).indexOf('multipart/form-data') >= 0
  let isFileReq = (req['headers']['content-type']).indexOf('application/octet-stream') >= 0

  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', () => {
    console.info(`[HTTP ${req.method.toUpperCase()} params]`, body)

    if (isWWWreq === true) {
      params = getParamsFromForm(body)
      getMockFiles(req, res)
    } else if (isMultipartFormReq === true) {
      handleMultipartDataForm(req, res)
    } else if(isJsonReq === true) {
      params = JSON.parse(body)
      getMockFiles(req, res)
    } else if (isFileReq === true) {
      handlePureFileUpload(body, req, res)
    } else {
      params = JSON.parse(decodeURIComponent(body))
      getMockFiles(req, res)
    }
  })
}

function allCrossAccess(res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
}

function routerApi (req, res, logger) {
  console.info(`[HTTP ${req.method.toUpperCase()} api]`, req.originalUrl, req.originalUrl)
  logger.info(`[HTTP ${req.method.toUpperCase()} api]`, req.originalUrl, req.originalUrl)

  // console.info(req)
  allCrossAccess(res)

  if (req.method === 'GET') {
    getAjaxGet(req, res)
  } else if (req.method === 'POST') {
    getAjaxPost(req, res)
  } else if (req.method === 'OPTIONS') {
    res.send(200)
  }

// if (next && typeof next === 'function') {
//   next()
// }
}

module.exports = routerApi
