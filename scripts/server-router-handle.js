const path = require('path')
const fs = require('fs')

function recieveSingleFile(req, res) {
  // const envCfg = require('../config/env-' + process.env.NODE_ENV || 'development')
  var file, fileObj, saveImgPath
  var fileObj = {
    code: '-1',
    data: '',
    detailMessage: '',
    message: ''
  }

  file = req.file
  saveImgPath = file.destination + file.originalname

  // res.set('content-type', 'text/html')
  res.set('content-type', 'application/json')

  fs.rename(req.file.path, saveImgPath, (err, doc) => {
    if (err) {
      fileObj.detailMessage = JSON.stringify(err)
      res.send(JSON.stringify(fileObj))
    } else {
      fileObj.code = '200'
      fileObj.imgUrl = saveImgPath
      res.send(JSON.stringify(fileObj))
    }
  })
}

function routerUploadSingleFile(req, res, next) {
  var reqPath = req.originalUrl
  recieveSingleFile(req, res, next)
  if (next) {
    next()
  }
}

function routerUploads(req, res, compiler) {
  // Content-Disposition': 'attachment; filename=upload.png
  const filename = decodeURIComponent(path.resolve(req.baseUrl.replace('/', '')))
  const externalName = filename.match(/\.([^\.]+)$/)

  if (externalName && externalName.length > 1) {
    // fs.readFile(filename, (err, data) => {
    //   if (err) {
    //     res.set('content-type', 'application/jason')
    //     res.send(JSON.stringify(getMessage(500, JSON.stringify(err))))
    //   } else {
    //     res.set('content-type', getContentType(externalName[1]))
    //     res.send(data)
    //   }
    // })
    fs.createReadStream(filename).pipe(res)
  } else {
    res.set('content-type', 'text/html')
    res.send(JSON.stringify(getMessage(404, 'file can not be found')))
  }
}

function getMessage(code, message) {
  let messageObj = {
    code: '404',
    data: '',
    detailMessage: 'file can not be found',
    message: ''
  }

  messageObj.code = code
  messageObj.message = message

  return messageObj
}

module.exports = {
  routerUploadSingleFile,
  routerUploads
}
