const http = require("http");

http.createServer(function (req, res) {
  var fileName = "." + req.url;

  console.info('******fileName:', fileName)

  if (fileName === "./stream") {
    res.writeHead(200, {
      "Content-Type":"text/event-stream",
      "Cache-Control":"no-cache",
      "Connection":"keep-alive",
      // "Access-Control-Allow-Origin": '*',
      'Access-Control-Allow-Origin': 'http://192.168.69.161:9000',
      'Access-Control-Allow-Credentials': true
    });
    res.write("retry: 10000\n");
    res.write("id: 123456\n");
    res.write("event: foo\n");
    res.write("data: " + (new Date()) + "\n\n");
    res.write("data: " + (new Date()) + "\n\n");

    interval = setInterval(function () {
      const msg = {"username": "bobby", "time": "02:34:11", "text": "Hi everyone."}
      msg.time = (new Date())

      res.write("id: 7777\n");
      res.write("data: " + JSON.stringify(msg) + "\n\n");
    }, 5000);

    req.connection.addListener("close", function () {
      clearInterval(interval);
    }, false);
  }
}).listen(3001, "0.0.0.0", () => {
  console.info('*******server start at: http://127.0.0.1:3001')
});
