function objectExtend(source, dest) {
  if(!dest) {
    return source
  }

  if(!source) {
    return dest
  }

  if(!source && !dest) {
    return null
  }

  for (let key in dest) {
    const item = dest[key]
    if(item && item.constructor.name.toLowerCase() === 'object') {
      source[key] = source[key] || {}
      objectExtend(source[key], item) 
    } else {
      source[key] = dest[key]
    }
  }

  return source
}

module.exports = objectExtend
