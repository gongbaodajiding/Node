const http = require('http');
const path = require('path');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    // 1、text/html的意思是将文件的content-type设置为text/html的形式，浏览器在获取到这种文件时会自动调用html的解析器对文件进行相应的处理。
    // 2、text/plain的意思是将文件设置为纯文本的形式，浏览器在获取到这种文件时并不会对其进行处理。
    // res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const url = req.url;
    let fpath = '';
    if (url === '/') {
        fpath = path.join(__dirname, '/clock/index.html');
    } else { // 需要有else之后的部分，因为浏览器在html加载的过程中会自动请求里边内嵌的css和js文件，如果没有的话，只能加载html，没有css和js
        fpath = path.join(__dirname, '/clock', url);
    }

    fs.readFile(fpath, 'utf-8', (err, data) => {
        if (err) return res.end('404 not found');
        res.end(data);
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});