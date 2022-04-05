const defaultTime = 3 * 1000

module.exports = function waitTime(time = defaultTime) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}