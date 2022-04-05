const app = require('http').createServer()
const io = require('socket.io')(app);
// const fs = require('fs');

app.listen(3001, '0.0.0.0', function() {
  console.info('******socket open******** http://127.0.0.1:3001')
});

// function handler (req, res) {
//   fs.readFile(__dirname + '/index.html',
//   (err, data) => {
//     if (err) {
//       res.writeHead(500);
//       return res.end('Error loading index.html');
//     }

//     res.writeHead(200);
//     res.end(data);
//   });
// }

io.on('connection', (socket) => {
  io.emit('total-connected', { hello: 'world' });

  // socket.on('my other event', (data) => {
  //   console.log(data);
  // });
  socket.on('disconnect', () => {
    console.info('*****close')
    io.emit('user disconnected');
  })
});

const news = io.of('/news')
news.on('connection', (socket) => {
  socket.emit('news-connected', { hello: 'news-connected' });

  // socket.on('my other event', (data) => {
  //   console.log(data);
  // });

  news.emit('news-another', {
      everyone: 'in'
    , '/news': 'will get'
  });

  socket.on('news-timer', (data) => {
    console.info('***news-timer***', data)
  })

  socket.on('disconnect', () => {
    console.info('*****close news')
    // io.emit('user disconnected');
  })
});

const chat = io.of('/chat')
chat.on('connection', (socket) => {
  socket.emit('connected-chat', { hello: 'chat-connected' });

  // socket.on('my other event', (data) => {
  //   console.log(data);
  // });

  socket.on('disconnect', () => {
    console.info('*****close chat')
    // io.emit('user disconnected');
  })
});
