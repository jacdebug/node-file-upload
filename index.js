const fs = require('fs');
const http = require('http');
const crypto = require('crypto');

const hostname = '127.0.0.1';
const port = 3000;

const slugify = text =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

const saveFilename = url =>
  `uploaded-file-${slugify(url)}-${crypto.randomBytes(16).toString('hex')}`;

const successObject = {
  success: true,
};

const errorObject = {
  error: 'HTTP Method not supported',
};

const server = http.createServer((req, res) => {
  // enable CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.writeHead(200);
    res.end();
    return;
  }

  // check http method
  if (req.method !== 'PUT') {
    res.end(JSON.stringify(errorObject));
    return;
  }

  const saveName = saveFilename(req.url);

  // create writable stream
  const file = fs.createWriteStream(`./uploaded-files/${saveName}`);

  // pipe req data to file stream
  req.pipe(file);

  // send success response on end
  req.on('end', () => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(successObject));
  });

  // error handler
  req.on('error', e => {
    console.error(`problem with request: ${e.message}`);
  });

  // log request
  console.log(`${new Date()} ${req.connection.remoteAddress} ${saveName}`);
});

server.listen(port, hostname, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);
