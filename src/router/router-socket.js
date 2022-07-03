const socket = require('socket.io')
const { log } = require('../utils/log-info')
const uui = require('uuid')
const clients = {}

// const WebSocket = require('ws')
// const { generateUserName } = require('./server-routers-monitor-utils')

// const clients = {}

// function removeClient(clientName) {
//   if (clients[clientName]) {
//     delete clients[clientName]
//   }
// }

// function brocastUpdateToWSclients(result) {
//   const clientKeys = Object.keys(clients)
//   log(`[WS] brocastUpdate: ${JSON.stringify(clientKeys)}`)

//   clientKeys.forEach(key => {
//     const ws = clients[key]['ws']
//     ws.send(JSON.stringify({
//       type: 'server-e2e-result',
//       data: {
//         result: result || getResultFromCache(),
//         dateTime: new Date().toLocaleString()
//       }
//     }))
//   })
// }

// function handleSocketMessage(data) {
//   const type = data

//   switch (type) {
//     case'client-close':
//       removeClient(data.name)
//       break
//   }
// }

// function addClient(ws, request) {
//   const { getResultFromCache } = require('./server-routers-monitor-utils')
//   // const [_path, params] = request?.url?.split('?');
//   // const connectionParams = queryString.parse(params);
//   // // NOTE: connectParams are not used here but good to understand how to get
//   // // to them if you need to pass data with the connection to identify it (e.g., a userId).
//   // console.log(connectionParams);
//   // console.info(request.url)
//   const clientName = generateUserName()
//   const client = {
//     name: clientName,
//     ws
//   }
//   clients[clientName] = client

//   log(`[WS] add: ${clientName}`)

//   ws.on('message', (message) => {
//     const parsedMessage = JSON.parse(message)
//     log(`[WS] message: ${JSON.stringify(parsedMessage)}`)
//     handleSocketMessage(parsedMessage)
//   })

//   ws.on('close', () => {
//     log(`[WS] close: ${clientName}`)
//     removeClient(clientName)
//   })

//   ws.send(JSON.stringify({
//     type: 'server-client-info',
//     data: {
//       name: clientName
//     }
//   }))

//   ws.send(JSON.stringify({
//     type: 'server-e2e-result',
//     data: {
//       result: getResultFromCache()
//     }
//   }))
// }

// function wsMiddleware(app, expressServer) {
//   const websocketServer = new WebSocket.Server({
//     noServer: true,
//     path: '/websockets',
//   });

//   expressServer.on('upgrade', (request, socket, head) => {
//     websocketServer.handleUpgrade(request, socket, head, (websocket) => {
//       websocketServer.emit('connection', websocket, request)
//     })
//   })

//   websocketServer.on('connection',(websocket, request) => {
//       addClient(websocket, request)
//     }
//   );
// }

function connectSocket(ctx) {
  ctx.io.on('connection', client => {
    console.log(client)
    const clientName = uui.v4()

    clients[clientName] = { socket: client }

    client.on('message', (from, data) => { 
      console.log('**message**', from, data)
    });

    client.on('disconnect', (clientName) => {
      console.log('**disconnect**', clientName)
      delete clients.clientName
     });
  });
}

function startUpSocket(app, server, router) {
  const io = socket(server);

  app.context.io = io

  router.get('/order-socket', async(ctx) => {
    connectSocket(ctx)
  })
}

module.exports = {
  startUpSocket
}

