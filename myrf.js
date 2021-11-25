const fs = require('fs');

function mineReadFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

mineReadFile('./成绩.txt').then(value => {
    console.log(value.toString());
}, reason => {
    console.log(reason);
});

const util = require('util');
// promisify可以转化为promise的形式
let mineReadFile2 = util.promisify(fs.readFile);

mineReadFile2('./成绩.txt').then(value => {
    console.log(value.toString());
}, reason => {
    console.log(reason);
});
