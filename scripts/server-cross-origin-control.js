const formidable = require('formidable')
const accessControl = require('./server-access-control')

function handlePost(req, res) {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    console.info({ fields, files })
    if (err) {
      return
    }
    res.cookie('postItem', '123456789', { maxAge: 60000, httpOnly: true })
    res.json({message: 'form success', status: 'ok'});
  })
}

function handleGet(req, res) {
  res.set({
    'Content-Type': 'text/plain;charset=UTF-8'
  })
  accessControl(res)
  if (req.method.toLowerCase() === 'options') {
    res.send(200)
  } else {
    res.cookie('onlyItem', '123456789', { maxAge: 60000, httpOnly: true })
    res.json({message: 'form success', status: 'ok'});
  }
}

function handleJsonP(req, res) {
  const callbackFn = req.query.callback
  res.set({
    'Content-Type': 'application/x-javascript;charset=UTF-8'
  })
  res.send(`${callbackFn}({a:5, c:5})`)
  res.end()
}

module.exports = {
  handlePost,
  handleGet,
  handleJsonP
}
