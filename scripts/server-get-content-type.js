function getContentType(extendsName){
  switch(extendsName){
    case 'js':
      return 'application/x-javascript'
    case 'css':
      return 'text/css'
    case 'html':
    case 'htm':
      return 'text/html'
    case 'icon':
      return 'image/x-icon'
    case 'png':
      return 'application/x-png'
    case 'gif':
      return 'image/gif'
    case 'jpg':
      return 'image/jpeg'
    case 'pdf':
      return 'application/pdf'
    case 'json':
      return 'application/json'
    case 'stream':
      return 'application/octet-stream' // 'application/octet-stream', 'application/x-msdownload'
    case 'mp4':
      return 'video/mp4'
    case 'mp3':
      return 'audio/mp3'
    case 'ico':
      return 'image/x-icon' // application/x-ico
    default:
      return 'text/plain'
  }
}

module.exports = getContentType
