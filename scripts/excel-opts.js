const fs = require('fs')
const path = require('path')
const getContentType = require('./server-get-content-type')

const excelOpts = {
  downLoadExcel(req, res) {
    let fileName = "订单列表-20190410144008.xlsx"
    let filePath = decodeURIComponent(path.join(__dirname, '../uploads/' + fileName))

    if (fs.existsSync(filePath)) {
      let state = fs.statSync(filePath)
      res.set('Content-Disposition', 'attachment; filename=' + encodeURIComponent(fileName))
      res.set('Content-Type', getContentType('stream') + ';charset=utf-8')
      res.set('Content-Length', state.size)
      fs.createReadStream(filePath).pipe(res)
    } else {
      res.set('Content-Type', getContentType('json') + ';charset=utf-8')
      res.send(JSON.stringify({'code': 404, 'msg': 'excel file not found'}))
      res.end()
    }
  }
}

module.exports = excelOpts
