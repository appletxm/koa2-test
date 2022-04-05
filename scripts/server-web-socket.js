const conns = new Array();
const host = '0.0.0.0'

const ws = require('node-websocket-server');
const server = ws.createServer();

server.addListener('connection', function(connection) {
  console.log('Connection request on Websocket-Server');
  conns.push(connection);
  connection.addListener('message',function(msg){
        console.log(msg);
        for(var i=0; i<conns.length; i++){
            if(conns[i]!=connection){
                conns[i].send(msg);
            }
        }
    });
});
server.listen(3001, host, () => {
  console.info('websocket server up at: http://127.0.0.1:3001')
});
