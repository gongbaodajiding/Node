const banji = {
    name: 'A',
    stus: [
        'xiaoming',
        'xiaohong',
        'xiaohua',
        'xiaoli'
    ],
    // 增加迭代接口
    [Symbol.iterator]: function () {
        let index = 0;
        // 返回一个对象
        return {
            next: () => {
                // 用箭头函数，this指向外层的banji对象
                if (index < this.stus.length) {
                    // 返回的结果包含值和done属性，done在成为true之前会一直遍历
                    const result = {value: this.stus[index], done: false};
                    index++;
                    return result;
                } else {
                    return {value: undefined, done: true};
                }
            }
        };
    }
};
// 由于对象没有iterable接口，无法用for of遍历，需要自定义
for (let v of banji) {
    console.log(v);
}
