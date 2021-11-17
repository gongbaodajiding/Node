const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    // 1、text/html的意思是将文件的content-type设置为text/html的形式，浏览器在获取到这种文件时会自动调用html的解析器对文件进行相应的处理。
    // 2、text/plain的意思是将文件设置为纯文本的形式，浏览器在获取到这种文件时并不会对其进行处理。
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('你好Hello World\n');

    const url = req.url;
    const method = req.method;
    const str = `request url is ${url}, request method is ${method}`;
    console.log(str);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
