const workPath = process.cwd()

function getExecParams(modulePath) {
  return {
    cwd: modulePath || workPath,
    // stdio: 'pipe',
    encoding: 'utf8',
    killSignal: 'SIGINT'
  }
}

module.exports = getExecParams
