const express = require('express')
const app = express()
const assetsRouter = require('./server-router-assets')
const crosOriginControl = require('./server-cross-origin-control')
const apiRouter = require('./server-router-api')
const logger = require('./server-log')
const cookieParser = require('cookie-parser')

const port = 9000
const host = '0.0.0.0'

app.use(cookieParser())

app.use(['/cross-origin-test/post'], (req, res) => {
  crosOriginControl.handlePost(req, res, logger)
})

app.use(['/cross-origin-test/get'], (req, res) => {
  crosOriginControl.handleGet(req, res, logger)
})

app.use(['/cross-origin-test/jsonp'], (req, res) => {
  crosOriginControl.handleJsonP(req, res, logger)
})

app.use(['/api', '/app/v1', '/web'], (req, res) => {
  apiRouter(req, res, logger)
})

app.use('/*.html', function (req, res) {
  assetsRouter(req, res, logger)
})

app.use(['/', '/src', '/assets'], (req, res) => {
  assetsRouter(req, res, logger)
})

app.use('*', (req, res) => {
  logger.info('No Url Matched', req.originalUrl)
  res.send('no matched url')
})

app.listen(port, host, function () {
  let url = 'http://' + host + ':' + port
  console.info('dev server started at: ', url)
  logger.info('dev server started at: ', url)
})
