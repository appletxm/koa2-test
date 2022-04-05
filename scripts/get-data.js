const https = require('https')
const fs = require('fs')
let index = 1

function getVideoFile(url, fileName) {
  let rejectCb = null
  let resolveCb = null

  console.info('****', url)

  let promise = new Promise((resolve, reject) => {
    resolveCb = resolve
    rejectCb = reject
  })

  https.get(url, function(res) {
      const { statusCode } = res
      if (statusCode === 200) {
        const stream = fs.createWriteStream(`../output/${fileName}.ts`, {flags: 'a'})
        res.pipe(stream);
        resolveCb(true)
      } else {
        rejectCb(false)
      }
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
      rejectCb(false)
    })

  return promise
}

function getFetchUrl(baseUrl, no) {
  let str = no + ''
  str = str.padStart(5, '0')
  return baseUrl + '-' + str + '.ts'
}

function getParameters() {
  console.info(process.argv)
  let max = 0
  let baseUrl = ''
  let fileName = ''

  const args = process.argv
  if (args && args.length > 1) {
    for(let i = 2; i <= args.length; i++) {
      if (args[i] === '--max' || args[i] === '-m') {
        max = args[i+1]
      }

      if (args[i] === '--baseUrl' || args[i] === '-b') {
        baseUrl = args[i+1]
      }

      if (args[i] === '--fileName' || args[i] === '-f') {
        fileName = args[i+1]
      }
    }
  }

  return {
    max,
    baseUrl,
    fileName: fileName || index++
  }
}

async function getAllVideos() {
  const {max, baseUrl, fileName} = getParameters()

  console.info(max, baseUrl, fileName)

  // fs.writeFileSync(`./output/${fileName}.ts`, '')

  for(let i = 1; i <= max; i++) {
    const url = getFetchUrl(baseUrl, i)
    try {
      await getVideoFile(url, fileName)
    } catch(err) {
      console.err(`${err} this is no ${url}`)
    }
  }
}

getAllVideos()
