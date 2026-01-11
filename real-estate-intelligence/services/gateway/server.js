const http = require('http');
http.createServer((_, res) => {
  res.end(JSON.stringify({
    system: 'InfinityX',
    status: 'online',
    mcp: '/mcp'
  }));
}).listen(8080);
