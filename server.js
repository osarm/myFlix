//This code wil call the modules: http, fs, and url
const http = require('http');
url = require('url');
fs = require('fs');

//create server function with http module
http.createServer((request, response) => {
    let addr = request.url,
        q = new URL(addr, 'http://' + request.headers.host),
        filePath = '';

    //Logs the accessed url and time stamps to log.txt
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });
   
    //Code checks for documentation file from client if present
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }
    
    //Checks for errors in file and displays them
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();

    });
}).listen(8080);

//the url where my server is running
console.log('Node test server is running on localhost:8080.');