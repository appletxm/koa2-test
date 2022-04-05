function getGMTdate(){
  let date = new Date()
  let mileSecondes = date.getTime()
  let gmtDate

  // mileSecondes = mileSecondes + 1 * 1000 * 5
  gmtDate = (new Date(mileSecondes)).toGMTString()

  return gmtDate
}

function cacheControl(res){
  // res.set('Cache-Control', 'max-age=600') //http 1.1 all response request html
  // res.set('Pragma', 'no-cache') //http1.0  all response request html
  // res.set('Expires', getGMTdate()) //http1.0  all response request html

  res.set('Last-Modified', getGMTdate()) //http1.1 response
  res.set('ETag', '1234567890') //http1.1 response
}

module.exports = {
  cacheControl,
  getGMTdate
}
