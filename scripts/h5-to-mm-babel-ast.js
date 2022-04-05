const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const babelParser = require('@babel/parser')
const t = require('@babel/types')
const path = require('path')
const fs = require('fs')

let dataPros = []
let componentsNodes = {}
let defaultComInmportIndexs = []
let configOptions = null

const events = {
  '$emit': 'triggerEvent'
}
const lifeCycles = {
  'beforeCreated': 'created',
  'created': 'attached',
  'mounted': 'ready',
  'destroyed': 'detached'
}

const dataObserver = {
  'watch': 'observers',
  'computed': 'observers'
}

function getStrikeName(name) {
  name = name.match(/([A-Z])([^A-Z]+)/g)
  name = name.map(item => item.toLowerCase())

  return name
}

function resetStates() {
  dataPros = []
  componentsNodes = {}
  defaultComInmportIndexs = []
}

function collectionDataProps(nodeName, pros) {
  // console.info('****nodeName***', nodeName)
  for (node of pros) {
    dataPros.push(node.key.name)
  }
}

function hintObserver(path) {
  const nextPath = path.getAllNextSiblings()
  const prePath = path.getAllPrevSiblings()
  const allPath = [...prePath, ...nextPath]

  // const allProperties = path.parentPath.node.value.properties
  let alReadyHasObservers = false
  let oldObserverPath = null
  
  for (let subPath of allPath) {
    if (subPath.node.key.name === 'observers') {
      alReadyHasObservers = true
      oldObserverPath = subPath
      break
    }
  }

  return {
    alReadyHasObservers,
    oldObserverPath
  }
}

function hitDataPath(currentPath) {
  const allSiblings = [...currentPath.getAllPrevSiblings(), ...currentPath.getAllNextSiblings()]
  const dataPathIndex = allSiblings.findIndex(sib => {
    const name = sib.node.key ? sib.node.key.name : ''
    return name === 'data'
  })
  const dataPath = allSiblings[dataPathIndex]
  // const dataType = dataPath.node.type
  // console.info('***dataType: ', dataType)

  return {
    allParentPath: allSiblings,
    dataPath,
    dataPathIndex
  }
}

function removeComponetImportNode(path) {
  const body = path.parentPath.node.body
  const newBody = []

  body.forEach((item, index) => {
    const isTemplate = t.isImportDeclaration(item) && (/^.+\.html$/).test(item.source.value)
    const matchedCompoent = defaultComInmportIndexs.find((sIndex) => sIndex === index)

    if(!matchedCompoent && !isTemplate) {
      newBody.push(item)
    }
  })

  path.parentPath.node.body = newBody
}

function generateComponentJson() {
  const josnObj = {
    'component': true,
    'usingComponents': {}
  }

  let newComponentsNodes = {}
  for (let name in componentsNodes) {
    // console.info('****', name, componentsNodes[name])
    const filePath = componentsNodes[name] + ((/^.+index(\.js)?$/).test(componentsNodes[name]) ? '' : '/index.js')
    // name = name.match(/([A-Z])([^A-Z]+)/g)
    // name = name.map(item => item.toLowerCase())
    name = getStrikeName(name)
    newComponentsNodes[name.join('-')] = filePath
  }
  josnObj['usingComponents'] = newComponentsNodes

  fs.writeFileSync(path.join(__dirname, '../tmp/index.json'), JSON.stringify(josnObj, null, ' '))
}

function getComponentsNode(path) {
  const propertiesAST = path.node.declaration.properties;
  const objectExpression = t.objectExpression(propertiesAST);
  const newAst = t.expressionStatement(
    t.callExpression(
      t.identifier('Compontents'), [
        objectExpression
      ]
    )
  )

  return newAst
}

function getDataObjNode(path) {
  const node = path.node
  const dataProps = node.body.body[0]['argument']['properties']

  collectionDataProps('data', dataProps)

  const objectExpression = t.objectExpression(dataProps)
  const ideData = t.identifier('data')
  const dataObjNode = t.objectProperty(ideData, objectExpression)

  return dataObjNode
}

function getDataProsNode(path) {
  const parent = path.parentPath
  if ((t.isAssignmentExpression(parent) && parent.get('left') === path) || t.isUpdateExpression(parent)) {
    const expressOld = path.findParent(parent =>
      parent.isExpressionStatement()
    )
    const { left, right } = expressOld.node.expression
    // const getLeft = expressOld.get('left')
    // const getRight = expressOld.get('right')
    const objKey = left.property
    const objVal = right
    const property = t.objectProperty(objKey, objVal)
    const objExpress = t.objectExpression([property])

    const idenProp = t.identifier('setData')
    const thisExpress = t.thisExpression()
    const memExpress = t.memberExpression(thisExpress, idenProp)
    const callExpress = t.callExpression(memExpress, [objExpress])

    const expressNew = t.expressionStatement(callExpress)

    expressOld.replaceWith(expressNew)

  } else {
    path.get('object').replaceWithSourceString('this.data')
  }
}

function getEventNode(path) {
  const name = path.node.property.name
  path.node.property.name = events[name]
}

function getLifeCycelsNode(path, name) {
  path.node.key.name = lifeCycles[name]
}

function createObserverProperty(observerProperties) {
  const property = t.objectProperty(t.identifier('observers'), t.objectExpression(observerProperties))
  return property
}

function getPropsNodes(path) {
  const pros = path.node.value.properties
  const parentNode = path.parentPath.parentPath.node

  // console.info('*******',  path.parentPath.key, pros && pros.length)

  if (t.isExportDefaultDeclaration(parentNode)) {
    path.node.key.name = 'properties'
  }

  if (t.isExportDefaultDeclaration(parentNode) && (pros && pros.length > 0)) {
    collectionDataProps('pros', pros)
  }
}

function getWatchObserversNode(path, name) {
  // find(callback) findParent(callback) // 'getAllPrevSiblings' // 'getAllNextSiblings'

  const { alReadyHasObservers, oldObserverPath } = hintObserver(path)
  const { properties } = path.node.value

  path.traverse({
    MemberExpression(path) {
      const name = path.node.property.name
      const type = path.node.object.type

      // console.info('*****watch ThisExpression*****', type, name)

      if (type === 'ThisExpression' && dataPros.includes(name)) {
        getDataProsNode(path)
      }
  
      if (type === 'ThisExpression' && events.hasOwnProperty(name)) {
        getEventNode(path)
      }
    }
  }, path)

  for(let property of properties) {
    let keyName = property.key.name
    if (!t.isStringLiteral(property.key)) {
      property.key = t.stringLiteral(keyName)
    }
  }

  if (!alReadyHasObservers) {
    path.node.key.name = dataObserver[name]
  } else {
    const oldProperties = oldObserverPath.node.value.properties
    oldObserverPath.node.value.properties = [...oldProperties, ...properties]
    path.remove()
  }
}

function genObserverBody(fnPath) {
  const fnName = fnPath.node.key ? fnPath.node.key.name : ''
  const fnExpress = t.functionExpression(null, [t.identifier('_this')], fnPath.node.body)
  const fnCall = t.callExpression(fnExpress, [t.thisExpression()])
  
  const property = t.objectProperty(t.identifier(fnName), fnCall)
  const properties = t.objectExpression([property])

  const memberExpress = t.memberExpression(t.thisExpression(), t.identifier('setData'))
  const arguments = [properties]

  const expressBody = t.expressionStatement(t.callExpression(memberExpress, arguments))
  const body = t.blockStatement([expressBody])

  return body
}

function getComputedObserversNode(currentPath) {
  const { allParentPath, dataPath } = hitDataPath(currentPath)
  // dataPath.node.value.properties
  let { alReadyHasObservers, oldObserverPath } = hintObserver(currentPath)
  const observerProperties = []

  collectionDataProps(currentPath.node.key.name, currentPath.node.value.properties)

  currentPath.traverse({
    ObjectMethod(fnPath) {
      const fnName = fnPath.node.key ? fnPath.node.key.name : ''
      const observerPropsNames = []

      // console.info('****ObjectMethod****', fnName)

      fnPath.traverse({
        MemberExpression(path) {
          const name = path.node.property.name
          const type = path.node.object.type

          // console.info('*****computed ThisExpression*****', type, name)

          if (type === 'ThisExpression' && dataPros.includes(name)) {
            observerPropsNames.push(name)
            path.get('object').replaceWithSourceString('_this.data')
          }
        }
      }, fnPath)
      
      // console.info('****observerPropsNames****', observerPropsNames)

      if (observerPropsNames.length > 0 && fnName) {
        const dataPro = t.objectProperty(t.identifier(fnName), t.stringLiteral(''))
        dataPath.node.value.properties.push(dataPro)

        const observerBody = genObserverBody(fnPath)
        const observerPropsItem = t.objectMethod('method', t.stringLiteral(observerPropsNames.join(', ')), [], observerBody)
        observerProperties.push(observerPropsItem)
      }
    }
  }, currentPath)

  if (!alReadyHasObservers) {
    observerNode = createObserverProperty(observerProperties)
    const observerIndex = allParentPath.findIndex(sPath => {
      const name = sPath.node.key ? sPath.node.key.name : ''
      return name === 'methods'
    })
    currentPath.parentPath.node.properties.splice(observerIndex - 1, 0, observerNode)
  } else {
    oldObserverPath.node.properties = oldObserverPath.node.properties.concat(observerProperties)
  }
  currentPath.remove()
}

function createThisDestruct(properties, kind = 'const', data) {
  const objProperties = []

  properties.forEach(property => {
    objProperties.push(t.objectProperty(t.identifier(property), t.identifier(property), false, true))
  })
  const objPattern = t.objectPattern(objProperties)
  const vardeclarator = t.variableDeclarator(objPattern, data ? t.memberExpression(t.thisExpression(), t.identifier('data')) : t.thisExpression())
  const varDec = t.variableDeclaration(kind, [vardeclarator])

  return varDec
}

function getLetConstDestructNode(path) {
  const declareation = path.node.declarations[0]
  const thisNode = declareation['init']

  if (t.isThisExpression(thisNode)) {
    const properties = declareation['id']['properties']
    const propsDatas = []
    const others = []
    const pPath = path.parentPath
    const body = pPath.node.body
    const kind = path.node.kind

    properties.forEach(property => {
      const name = property.key.name
      if (dataPros.includes(name)) {
        propsDatas.push(name)
      } else {
        others.push(name)
      }
    })

    // console.info('****getLetConstDestructNode***', propsDatas, others)

    if (propsDatas.length === properties.length) {
      path.node.declarations[0]['init'] = t.memberExpression(t.thisExpression(), t.identifier('data'))
    } else if (others.length === properties.length) {
      // console.info('***getLetConstDestructNode ignore**')
    } else {
      if (t.isBlockStatement(pPath.node)) {
        // console.info('*******', body)
        const index = body.findIndex(item => item === path.node)
        const otherBody = createThisDestruct(others, kind)
        const dataPropsBody = createThisDestruct(propsDatas, kind, 'data')
        path.parentPath.node.body.splice(index, 1, otherBody)
        path.parentPath.node.body.splice(index, 0, dataPropsBody)
      }
    }
  }
}

function getSubComponentsNode(path) {
  const value = path.node.value
  const components = value ? value.properties : []
  const body = path.parentPath.parentPath.parentPath.node.body
  
  components.forEach(item => {
    const name = item.value.name
    
    const index = body.findIndex(node => {
      const { source, specifiers } = node

      const defaultSpec = specifiers.find(spec => t.isImportDefaultSpecifier(spec))
      const res = defaultSpec && name === defaultSpec.local.name
      
      if (res) {
        // console.info(name, '===' , defaultSpec.local.name, '***', source.value)
        componentsNodes[name] = source.value
      }

      return res
    })

    defaultComInmportIndexs.push(index)
  })

  path.remove()
}

function getMixinsNodes(path) {
  const parentBody = path.parentPath.parentPath.parentPath.node.body
  const mixinsNodes = path.node.value.elements

  // parentBody.forEach(node => {
  //   if(t.variableDeclaration(node.type)) {
      
  //   }
  // })
}

function transfer$Props(path) {
  const returnNode = t.returnStatement(t.memberExpression(t.thisExpression(), t.identifier('data')))
  const block = t.blockStatement([returnNode])
  const $props = t.objectMethod('get', t.identifier('$props'), [], block)

  path.node.declaration.properties.push($props)
}

function transfer$NextTick(path) {
  const block = t.blockStatement([t.expressionStatement(t.callExpression(t.identifier('fn'), []))])
  const arrowFn = t.arrowFunctionExpression([], block)
  const time = t.numericLiteral(0)
  const timeFn = t.callExpression(t.identifier('setTimeout'), [arrowFn, time])
  const body = t.blockStatement([t.expressionStatement(timeFn)])
  const params = [t.identifier('fn')]
  const $nextTick = t.objectMethod('method', t.identifier('$nextTick'), params, body)

  path.node.declaration.properties.push($nextTick)
}

function transfer$el(path) {
  const member = t.memberExpression(t.identifier('wx'), t.identifier('createSelectorQuery'))
  const returnNode = t.returnStatement(t.callExpression(member, [t.thisExpression()]))
  const block = t.blockStatement([returnNode])
  const $props = t.objectMethod('get', t.identifier('$el'), [], block)

  path.node.declaration.properties.push($props)
}

function getComponentExternalName(path) {
  const properties = path.node.declaration.properties
  const dataPath = properties.filter(prop => prop.key && prop.key.name === 'data')
  const namePath = properties.filter(prop => prop.key && prop.key.name === 'name')

  let originName = namePath && namePath.length > 0 ? namePath[0]['value']['value'] : ''

  originName = getStrikeName(originName)

  const extName = originName.join('-') + '-c-ext-class'

  const dataPropertiest = dataPath && dataPath.length > 0 ? dataPath[0].value.properties : []
  if (dataPropertiest && dataPropertiest.length > 0) {
    dataPropertiest.push(t.objectProperty(t.identifier('externalClassName'), t.stringLiteral(extName)))
    dataPath[0].value.properties = dataPropertiest
  }

  return extName
}

function transfer$ExternalClassName(path) {
  const externalName = getComponentExternalName(path)
  const left = t.binaryExpression('+', t.memberExpression(t.identifier('cfg'), t.identifier('prefix')), t.stringLiteral('-'))
  const returnNode = t.returnStatement(t.binaryExpression('+', left, t.stringLiteral(externalName)))
  const block = t.blockStatement([returnNode])
  const $extClass = t.objectMethod('get', t.identifier('$externalClassName'), [], block)

  path.node.declaration.properties.push($extClass)
}

function  addExternalClass(path) {
  const member = t.memberExpression(t.thisExpression(), t.identifier('$externalClassName'))
  const arrayExpress = t.arrayExpression([member])
  const property = t.objectProperty(t.identifier('externalClasses'), arrayExpress)
  path.node.declaration.properties.splice(2, 0, property)
}

function addOptions(path) {
  const property = t.objectProperty(t.identifier('multipleSlots'), t.booleanLiteral(true))
  const objExpress = t.objectExpression([property])
  const optionProperty = t.objectProperty(t.identifier('options'), objExpress)
  path.node.declaration.properties.splice(2, 0, optionProperty)
}

function transferDefaultNodes(path) {
  path.traverse({
    ObjectMethod(path) {
      const node = path.node
      const key = node.key
      const name = key ? key.name : ''
  
      // console.info('*****ObjectMethod****', name)
  
      if (name === 'data') {
        const datdObjNode = getDataObjNode(path)
        path.replaceWith(datdObjNode)
      } else if (lifeCycles.hasOwnProperty(name)) {
        getLifeCycelsNode(path, name)
      } else {}
    },
  
    ObjectProperty(path) {
      const { key } = path.node
      const { name } = key
  
      // console.info('*****ObjectProperty****', name)
  
      if (name === 'props') {
        getPropsNodes(path)
      }
  
      if (name === 'default') {
        path.node.key.name = 'value'
      }
  
      if (name === 'watch') {
        getWatchObserversNode(path, name)
      }
  
      if (name === 'computed') {
        getComputedObserversNode(path)
      }

      if (name === 'template') {
        path.remove()
      }

      if (name === 'mixins') {
        getMixinsNodes(path)
        path.node.key.name = 'behaviors'
      }

      if (name === 'components') {
        getSubComponentsNode(path)
        generateComponentJson()
      }
    },
  
    MemberExpression(path) {
      const name = path.node.property.name
      const type = path.node.object.type
  
      // console.info('*****MemberExpression****', name, dataPros)
  
      if (type === 'ThisExpression' && dataPros.includes(name)) {
        getDataProsNode(path)
      }
  
      if (type === 'ThisExpression' && events.hasOwnProperty(name)) {
        getEventNode(path)
      }
    },

    VariableDeclaration(path) {
      getLetConstDestructNode(path)
    }
  }, path)
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

  configOptions = options

  const code = fs.readFileSync(src, {
    encoding: 'utf8'
  })
  
  const ast = babelParser.parse(code, {
    ast: true,
    allowUndeclaredExports: true,
    sourceType: 'module'
    // 'plugins': [
    //   ['@babel/plugin-proposal-decorators', { 'legacy': true }]
    // ]
  })
  
  resetStates()

  traverse(ast, {
    ExportDefaultDeclaration(path) {
      if (path.node.type === 'ExportDefaultDeclaration') {

        transferDefaultNodes(path)

        removeComponetImportNode(path)

        transfer$Props(path)

        transfer$NextTick(path)

        transfer$el(path)

        transfer$ExternalClassName(path)

        addExternalClass(path)

        addOptions(path)

        if (path.node.declaration.properties) {
          const newNode = getComponentsNode(path)
          path.replaceWith(newNode)
        }
      }
    }
  })
  
  const genCode = generate(ast, {
    ast: true,
    filename: 'testComponent',
    quotes: 'single',
    concise: false,
    // retainLines: true
  }, code)
  
  fs.writeFileSync(dest, genCode.code, {
    encoding: 'utf8'
  })
}

doTransfer({
  src: path.join(__dirname, '../assets/vuejs/complex-component.js'), 
  dest: path.join(__dirname, '../tmp/index.js')
})

module.exports = {
  doTransfer
}