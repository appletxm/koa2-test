const msg = {
  code_400_msg: 'parameters error',
  code_404_msg: 'resource not exist'
}

function getMessage(code, message, data) {
  let messageObj = {
    code: '404',
    data: '',
    message: ''
  }

  if (data) {
    messageObj.data = data
  }

  message = msg[`code_${code}_msg`] || ''

  messageObj.code = code
  messageObj.message = typeof message === 'string' ? message : JSON.stringify(message)

  return messageObj
}

module.exports = {
  'CODE_404'(err) {
    return getMessage(404, err)
  },

  'CODE_500'(err) {
    return getMessage(500, err)
  },

  'CODE_200'(res) {
    return getMessage(200, '', res)
  },

  'CODE_400'(res) {
    return getMessage(400, '', res)
  }
}
