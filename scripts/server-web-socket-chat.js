var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const port = 3001

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port);

io.on('connection', function (client) {
  console.log('Client connected...');

  client.on('join', function (data) {
    console.log(data);
  });
})
