function createPromise() {
  let resolveCb = null
  let rejectCb = null
  const promise = new Promise((resolve, reject) => {
    resolveCb = resolve
    rejectCb = reject
  })

  return {
    promise,
    resolveCb,
    rejectCb
  }
}

module.exports = createPromise
