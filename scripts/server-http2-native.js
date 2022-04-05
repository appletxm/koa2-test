const http2 = require('http2')
const fs = require('fs')
const path = require('path')
const port = 3000
const host = '0.0.0.0'
const routerAssets = require('./server-router')
const logger = require('./server-log')

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../http2-auth/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../http2-auth/server.crt'))
}

const server = http2.createSecureServer(options, (req, res) => {
  let path = req['headers'][':path']
  req.originalUrl = path
  req.baseUrl = path
  req.path = path
  // res.end('<h1>Hello World!</h1>')
  if (path === '/') {
    res.set('content-type', 'text/html')
    res.send(fs.readFileSync(path.resolve(__dirname, '../html-webapi/js-http2.html')))
    res.end()
  } else {
    routerAssets(req, res, logger)
  }
})

server.listen(port, host, (err) => {
  if (err) {
    console.error(err)
    return process.exit(1)
  }

  console.log(`Server is running on https://${host}:${port}`)
})
