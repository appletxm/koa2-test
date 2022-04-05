const express = require('express')
// const http2 = require('http2')
const fs = require('fs')
const path = require('path')
const port = 3000
const app = express()
const spdy = require('spdy')
// const routerAssets = require('./server-router')
const logger = require('./server-log')
const ipAddress = require('ip').address()
const assignRouter = require('./server-router-assets')

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../http2-auth/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../http2-auth/server.crt'))
}

// app.get('/assets/images/*', (req, res) => {
//   routerAssets(req, res, logger)
// })

app.get('/', (req, res) => {
  // res.status(200).sendFile(fs.readFileSync(path.resolve(__dirname, '../http2.html')))
  res.set('content-type', 'text/html')
  res.send(fs.readFileSync(path.resolve(__dirname, '../html-webapi/js-http2.html')))
  res.end()
})

app.use(['/proxy/*'], function(req, res) {
  req.originalUrl = req.originalUrl.replace('/proxy', './')
  console.info(req.originalUrl)
  assignRouter(req, res, logger)
})

app.use('/*.html', function (req, res) {
  assignRouter(req, res, logger)
})

app.use('/*.js', function (req, res) {
  assignRouter(req, res, logger)
})

app.use('/*.css', function (req, res) {
  assignRouter(req, res, logger)
})

app.use('/*.pdf', function (req, res) {
  assignRouter(req, res, logger)
})

app.use(['/*.png', '/*.jpg', '/*.gif', '/*.jpeg', '/*.ico'], function (req, res) {
  assignRouter(req, res, logger)
})

spdy.createServer(options, app).listen(port, ipAddress, (error) => {
  if (error) {
    console.error(error)
    return process.exit(1)
  } else {
    console.log(`Server is running on https://${ipAddress}:${port}`)
  }
})

// http2.createSecureServer(options, app).listen(PORT, ipAddress, (err) => {
//   if (err) {
//     console.error(err)
//     return process.exit(1)
//   }

//   console.log(`Server is running on https://${host}:${ PORT }`)
// })
