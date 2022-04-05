const UglifyJS = require("uglify-js")
const fs = require('fs')

// console.info('script file path:', __dirname, ' *** process base path:', process.cwd())

function uglifySignleFile(filePath, outPthPath) {
  const options = {
    toplevel: true,
    compress: {
      global_defs: {
        "@console.log": "alert"
      },
      passes: 2
    },
    output: {
      beautify: false
    }
  }

  const jsFile = fs.readFileSync(filePath, {
    encoding: 'utf8'
  }).toString()

  const result = UglifyJS.minify(jsFile, options)

  if (result.error) {
    throw error
  } else {
    fs.writeFileSync(outPthPath, result.code, {
      encoding: 'utf8'
    })
  }
}

function uglifyAndMergeFile(files, outputPath) {
  options = {
    toplevel: true,
    compress: {
      global_defs: {
        "@console.log": "alert"
      },
      passes: 2
    },
    output: {
      beautify: false,
      preamble: "/* uglified */"
    }
  }

  fs.writeFileSync("part1.js", UglifyJS.minify({
    "file1.js": fs.readFileSync("file1.js", "utf8"),
    "file2.js": fs.readFileSync("file2.js", "utf8")
  }, options).code, "utf8")
}

module.exports = {
  uglifySignleFile,
  uglifyAndMergeFile
}

uglifySignleFile('./bin/jsencrypt.3.0.0-rc.1.js', './bin/jsencrypt.3.0.0-rc.1.min.js')
