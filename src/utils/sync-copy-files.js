const fs = require('fs')
const path = require('path')
const { log } = require('./util-log')

function cpoyFile (srcPath, destPath) {
  fs.copyFileSync(srcPath, destPath)
}

function readdir (srcPath) {
  let files = []

  files = fs.readdirSync(srcPath)

  return files
}

function copyFolder (options) {
  const { srcPath, destPath, ignore } = options
  let files = []

  if (fs.lstatSync(srcPath).isDirectory()) {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath)
    }
    files = readdir(srcPath)
  }

  if (files && files.length > 0) {
    files.forEach((file) => {
      if (ignore && ignore.test(file)) {
        log(`skipe file: ${srcPath}/${file}`)
      } else {
        let curSource = path.join(srcPath, file)
        let targetFolder = path.join(destPath, file)

        if (fs.lstatSync(curSource).isDirectory()) {
          // copyFolder(curSource, targetFolder)
          copyFolder({
            srcPath: curSource,
            destPath: targetFolder,
            ignore
          })
        } else {
          cpoyFile(curSource, targetFolder)
        }
      }
    })
  }
}

function checkDirIsOk (checkPath) {
  let paths
  let pathStr = ''

  // log('\n checkPath: ' + checkPath)

  if (fs.existsSync(checkPath) === true) {
    return
  }

  paths = typeof checkPath === 'string' ? checkPath.trim().split(/\\|\/|\//) : checkPath

  paths.forEach(pathKey => {
    // let createPath

    if (pathKey) {
      pathStr += '/' + pathKey
      // log(`**checkDirIsOk** ${path.join(__dirname, '../', pathStr)}`)
      const folderPath = `${path.join(__dirname, '../', pathStr)}`

      if (fs.existsSync(folderPath) !== true) {
        fs.mkdirSync(folderPath)
      }
    }
  })
}

module.exports = {
  cpoyFile,
  readdir,
  copyFolder,
  checkDirIsOk
}
