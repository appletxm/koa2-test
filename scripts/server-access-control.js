module.exports = function (res) {
  res.header("Access-Control-Allow-Credentials", "true");
  // res.header('Access-Control-Allow-Origin', 'http://192.168.21.109:8000'); // client side need withCredentials: true, credentials: true need to check the request header origin equal the  Access-Control-Allow-Origin's value
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, accesstoken');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
}
