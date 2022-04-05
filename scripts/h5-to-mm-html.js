const { parseDOM, DomUtils } = require("htmlparser2")
const path = require('path')
const fs = require('fs')

let configOptions = {
  directives: {
    'v-show': 'wx:if',
    'v-for': 'wx:for',
    'v-model': 'model:value',
    ':key': 'wx:key',
    'v-key': 'wx:key',
    'v-if': 'wx:if',
    'v-elseif': 'wx:elseif',
    'v-else': 'wx:else'
  },
  tags: {
    'span': 'text',
    'i': 'text',
    'em': 'text',
    'b': 'text',
    'header': 'text',
    'footer': 'text',
    'nav': 'text',
  
    'p': 'view',
    'div': 'view',
    'h1': 'view',
    'h2': 'view',
    'h3': 'view',
    'ul': 'text',
    'li': 'text',
    'table': 'view',
    'thead': 'view',
    'th': 'text',
    'tbody': 'view',
    'tr':'view',
    'td': 'text'
  },
  events: {
    'click': 'tap'
  }
}

function mergeOptions(options) {
  const cfg = Object.assign(configOptions, options)
  return cfg
}

function resetStates() {
}

function getTranferHtml(domList) {
  let html = ''
  domList.forEach(dom => {
    html = html + DomUtils.getOuterHTML(dom)
  })
  html =  html.replace(/&apos;/g, '\'')
  html = html.replace(/&gt;/g, '>')
  html = html.replace(/&amp;/g, '&')

  return html
}

function transferAttr(config, attrs) {
  const newAttrs = {}
  const dynamicReg = /^\:.+$/
  const directiveReg = /^v-.+$/
  const eventReg = /^(v-bind\:|@).+$/

  const { directives, events } = config

  for (let attr in attrs) {
    let key = attr.trim()
    let value = attrs[attr].trim()
    let needUpdateVal = false

    if (dynamicReg.test(attr)) {
      key = key.replace(/^:/, '')

      if (value.match(/\[([^\[\]]*)?\]/g) && (/^\:class$/).test(attr)) {
        value = value + '.join(\' \')'
      }

      needUpdateVal = true
    }

    if (directiveReg.test(attr)) {
      key = directives[key] || key
      delete attrs[attr]
      needUpdateVal = true
    }

    if (eventReg.test(attr)) {
      key = key.replace(/^(v-bind\:|@)/, '')
      key = `bind:${events[key] || key}`
      needUpdateVal = true
    }

    value = needUpdateVal ? `\{\{ ${value} \}\}` : value
    newAttrs[key] = value
  }

  return newAttrs
}

function transferDom(config, nodes) {
  const { tags } = config

  for (let i = 0;  i < nodes.length; i++) {
    const node = nodes[i]
    const { attribs, children, name } = node

    node.name = tags[name]  || name

    if (attribs) {
      const newAttrs = transferAttr(config, attribs)
      node.attribs = newAttrs
    }
    if (children && children.length > 0) {
      transferDom(config, children)
    }
  }
}

function addExternalClass(node) {
  let className = node[0]['attribs']['class']
  const cfgPrefixClass = `\`\$\{cfg.prefix\}-\$\{externalClassName\}\``

  if (className) {
    const matched = className.match(/\[([\s\S]+)?\]/m)
    if (matched && matched.length > 1) {
      className = matched[1] + ', ' + cfgPrefixClass
      className = `\{\{ [${className}].join(' ') \}\}`
    } else {
      let ctxClass = className.match(/\{\{([\s\S]+)?\}\}/m)
      if (ctxClass && ctxClass.length > 1) {
        className = `\{\{ [${ctxClass[1]}, ${cfgPrefixClass}].join(' ') \}\}`
      } else {
        className = `\{\{ ['${className}', ${cfgPrefixClass}].join(' ') \}\}`
      }
    }
  } else {
    className = cfgPrefixClass
  }

  node[0]['attribs']['class'] = className
}

/***
 * Object {}
 * {
 *  src 
 *  dest
 *  ignore
 * }
*/
function doTransfer(options) {
  const { src, dest } = options

  configOptions = mergeOptions(options)

  const code = fs.readFileSync(src, { encoding: 'utf8' })
  const parserDom = parseDOM(code)

  if (parserDom.length > 1) {
    throw new Error('Please make sure the single root node')
  }

  resetStates()
  transferDom(configOptions, parserDom)
  addExternalClass(parserDom)
  
  const html = getTranferHtml(parserDom)

  fs.writeFileSync(dest, html, {encoding: 'utf8'})
}

doTransfer({
  src: path.join(__dirname, '../assets/vuejs/complex-template.html'), 
  dest: path.join(__dirname, '../tmp/index.wxml')
})

module.exports = {
  doTransfer
}