const error = {
  500: {
    status: 500,
    colode: 500,
    msg: 'Internal error'
  },

  404: {
    status: 404,
    colode: 404,
    msg: 'Resource not found'
  },

  401: {
    status: 401,
    colode: 401,
    msg: 'Authantication expired'
  },

  200: {
    status: 200,
    colode: 200,
    msg: 'Request success'
  }
}

const defaultError = error['500']

function getErrorMsg(code, msg) {
  let msgObj = error[code]
  
  if (!msgObj) {
    msgObj = defaultError
  }

  if (msg) {
    msgObj.msg = msg
  }
}

module.exports = getErrorMsg
