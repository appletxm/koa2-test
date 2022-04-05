const express = require('express')
// const path = require('path')
// const open = require('open')
const cookieParser = require('cookie-parser')
const chalk = require('chalk')
const app = express()
const assignRouter = require('./server-router-assets')
const apiRouter = require('./server-router-api')
const wasmRouter = require('./server-router-aswm')
const { routerUploadSingleFile } = require('./server-router-handle')
const logger = require('./server-log')
const ipAddress = require('ip').address()
const port = 8000
const host = '0.0.0.0'

const compression = require('compression')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

app.use(cookieParser())

// set a filter for compression
// app.use(['/*.js', '/*.css', '/*.html'], compression({ filter: function(req, res) {
//   // if (req.originalUrl.indexOf('/assets/images/') >= 0 || req.originalUrl.indexOf('/assets/images/') >= 0) {
//   //   return true
//   // }
//   // return false
//   return true
// }}))

app.use(['/*.js', '/*.css', '/*.html'], compression())

// single file
app.use(['/api/upload'], upload.single('file'), function (req, res) {
  routerUploadSingleFile(req, res)
})

app.use(['/api', '/app/v1', '/web', '/uploads/*', '*/videos/*'], (req, res) => {
  console.info('cookie is:', req.cookies)
  apiRouter(req, res, logger)
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

app.use(['/*.wasm', '/*.wat'], function (req, res) {
  wasmRouter(req, res, logger)
})

// app.use(['/', '/src', '/assets'], (req, res) => {
//   assignRouter(req, res, logger)
// })

app.use('*', (req, res) => {
  logger.info('No Url Matched', req.originalUrl)
  res.send('no matched url')
})

app.listen(port, host, function () {
  const localUrl = `http://localhost:${port}`
  const ipUrl = `http://${ipAddress}:${port}`
  console.info(`${chalk.magenta('dev server started at: ')}`)
  console.info(`loclhost: ${chalk.blue(localUrl)}`)
  console.info(`ip: ${chalk.blue(ipUrl)}`)

// setTimeout(function () {
//   let openUrl = url
//   open(openUrl, 'chrome')
// }, 3000)
})
