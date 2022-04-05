module.exports = function ({ types: t }) {
  return {
    visitor: {
      StringLiteral(path, state) {
        // console.info('**StringLiteral****', path.node.value, state.opts)
        // return
        if (path.node.value === 'txm') {
          path.replaceWith(t.stringLiteral(state.opts.test))
        }
      }
      // BinaryExpression(path, state) {
      //   console.info('**BinaryExpression****', path.node.operator, state.opts)
      // }
    }
  }
}