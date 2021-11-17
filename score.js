const fs = require('fs');
const path = require('path');
// fs.readFile('./成绩.txt', 'utf8', function (err, data) {
//     if (err) {
//         return console.log('读取失败' + err.message);
//     }
//     console.log('读取成功' + data);
//     console.log(typeof (data));
//     let scoreOld = data.split(' ');
//     console.log(scoreOld);
// });

fs.readFile(path.join(__dirname, '/成绩.txt'), 'utf8', (err, data) => {
    // 如果出现异常直接抛出异常
    if (err) throw err;
    console.log('读取成功');

    let scoreOld = data.split(' ');
    let arrNew = [];
    scoreOld.forEach(item => arrNew.push(item.replace('=', '：')));
    let scoreNew = arrNew.join('\r\n');

    fs.writeFile('./成绩新.txt', scoreNew, err => {
        if (err) throw err;
        console.log('写入成功');
    });
});

