const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/me',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer testdummy'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});
req.on('error', console.error);
req.end();
