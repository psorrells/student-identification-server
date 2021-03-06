const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises;
const url = require('url');
const querystring = require('querystring')
const figlet = require('figlet');
const path = require('path');

const PORT = process.env.PORT || 8000

async function serveFile(filePath, contentType, response) {
  const params = querystring.parse(url.parse(req.url).query)
  try {
    const rawData = await fsPromises.readFile(
      filePath,
      !contentType.includes('image') ? 'utf8' : '');
    const data = contentType === 'application/json'
      ? JSON.parse(rawData) : rawData;
    response.writeHead(
      filePath.includes('404.html') ? 404 : 200,
       {'Content-type': contentType});
    response.end(
      contentType === 'application/json' 
        ? 'student' in params 
            ? returnObject(params['student'])
            : returnObject('unknown')
        : data
    );
  } catch(err) {
    console.log(err);
    response.statusCode = 500;
    response.end();
  }
}


const server = http.createServer((req, res) => {
  console.log(req.url, req.method)

  const extension = path.extname(req.url);

  let contentType;
  
  switch(extension) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.txt':
      contentType = 'text/plain';
      break;
    default:
      contentType = 'text/html';
      break;

  }

  let filePath = 
    contentType === 'text/html' && req.url === '/'
      ? path.join(__dirname,'index.html')
      : contentType === 'text/html' && req.url.slice(-1) === '/'
          ? path.join(__dirname, req.url, 'index.html')
          : contentType === 'text/html'
              ? path.join(__dirname, req.url)
              : path.join(__dirname, req.url);

  //makes .html extension not required in the browser
  if (!extension && req.url.slice(-1) !== '/') filePath += '.html'

  const fileExists = fs.existsSync(filePath);

  if (fileExists) {
    //serve the file
    serveFile(filePath, contentType, res)
  } else {
    //404 or 301
    console.log(path.parse(filePath))
    figlet('404!!', function(err, data) {
      if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
      }
      res.write(data);
      res.end();
    });
    
  }
});

function returnObject(student) {
  let obj = {
    name: 'unknown',
    status: 'unknown',
    currentOccupation: 'unknown'
  }

  if (student.toLowerCase() === 'pamela') {
    obj.name = "Pamela"
    obj.status = "Anxious"
    obj.currentOccupation = "Coder"
  }

  return obj
}

server.listen(PORT);
