const express = require('express')
// const path = require('path')
// const open = require('open')
const chalk = require('chalk')
const app = express()
const assignRouter = require('./server-router-assets')
const apiRouter = require('./server-router-api')
const logger = require('./server-log')
const ipAddress = require('ip').address()
const port = 8000
const host = '127.0.0.1'

app.use(['/api', '/app/v1', '/web'], (req, res) => {
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

app.use(['/.png', '/*.jpg', '/*.gif', '/*.jpeg', '/*.ico'], function (req, res) {
  assignRouter(req, res, logger)
})

// app.use(['/', '/src', '/assets'], (req, res) => {
//   assignRouter(req, res, logger)
// })

app.use('*', (req, res) => {
  logger.info('No Url Matched', req.originalUrl)
  res.send('no matched url')
})

app.listen(port, host, function () {
  // const localUrl = `http://localhost:${port}`
  const ipUrl = `http://${host}:${port}`
  console.info(`${chalk.magenta('dev server started at: ')}`)
  // console.info(`loclhost: ${chalk.blue(localUrl)}`)
  console.info(`ip: ${chalk.blue(ipUrl)}`)

// setTimeout(function () {
//   let openUrl = url
//   open(openUrl, 'chrome')
// }, 3000)
})
