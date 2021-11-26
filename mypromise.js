// 声明构造函数，并接受一个参数作为执行器函数
function Promise(executor) {
    // 添加属性，这里this指向该构造函数的实例
    this.PromiseState = 'pending';
    this.PromiseResult = null;
    // 建立一个callback属性用来保存回调函数，并且因为可能有多个回调，所以为数组形式
    this.callback = [];
    // 下面不能直接用this，因为resolve和reject函数是普通函数直接进行调用，this会指向window
    // 所以用self保存this实例
    const self = this;

    // resolve函数，该函数对应的是executor的实参，和外面定义的Promise形参不同
    function resolve(data) {
        //  判断当前状态是否已经更改过，保证状态只能更改一次
        if (self.PromiseState !== 'pending') return;
        self.PromiseState = 'fulfilled';
        self.PromiseResult = data;
        // 遍历callback数组，执行回调函数
        self.callback.forEach(item => {
            item.onResolved(data);
        });
    }

    // reject函数，该函数对应的是executor的实参，和外面定义的Promise形参不同
    function reject(data) {
        //  判断当前状态是否已经更改过，保证状态只能更改一次
        if (self.PromiseState !== 'pending') return;
        self.PromiseState = 'rejected';
        self.PromiseResult = data;
        self.callback.forEach(item => {
            item.onRejected(data);
        });
    }

    // 同步调用执行器函数，并进行异常的捕获
    try {
        executor(resolve, reject);
    } catch (e) {
        // 同样需要修改对象属性为rejected，只需调用reject并把异常传给他即可
        reject(e);
    }
}

// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
    // 用self保存this指向的Promise对象实例
    const self = this;
    // 如果没有定义resolve和reject函数，then仍然是可以运行的，不会报错
    if (typeof onResolved !== 'function') {
        // 相当于手动加了一个resolve函数
        onResolved = value => value;
    }
    if (typeof onRejected !== 'function') {
        // 这里用throw，可以保证catch方法可以捕获异常，且这个异常可以进行穿透
        onRejected = reason => {
            throw reason;
        };
    }
    // then应该返回一个Promise对象，并且这个对象的状态由回调函数执行的结果确定
    return new Promise((resolve, reject) => {
        // 封装一个函数，便于代码的复用
        function callback(type) {
            try {
                // 调用成功时的函数，并把值（即上面的形参data）传进去
                // 用result接收回调函数执行的结果
                let result = type(self.PromiseResult);
                // 如果result是一个新的Promise函数，则then返回的Promise对象的结果就是新Promise函数的结果
                // 所以这里可以直接对新Promise函数调用then方法，成功的话就执行resolve并把新Promise函数的参数传递进来
                if (result instanceof Promise) {
                    result.then(v => {
                        resolve(v);
                    }, r => {
                        reject(r);
                    });
                } else {
                    // 如果返回非Promise，则then返回的Promise对象直接成功并调用resolve
                    resolve(result);
                }
            } catch (e) {
                // 如果抛出异常，then返回的Promise对象状态为reject
                reject(e);
            }
        }

        // 先判断状态，这里this指向调用then的实例p。虽然在新构造函数中，但this仍指向调用then的实例p
        if (this.PromiseState === 'fulfilled') {
            callback(onResolved);
        }
        if (this.PromiseState === 'rejected') {
            callback(onRejected);
        }
        // 如果是异步任务，则需要等状态改变的时候执行回调函数
        // 所以需要先保存回调函数为对象的一个属性，等状态改变时再调用
        if (this.PromiseState === 'pending') {
            this.callback.push({
                // onResolved: onResolved,
                // onRejected: onRejected
                // 在异步任务中，由于不是一开始就先改变状态，所以p的状态一开始为pending
                // 但在这里如果采用上边代码，只保存了回调函数，没有作别的改变，则then返回的Promise对象状态也会是pending
                onResolved: function () {
                    callback(onResolved);
                },
                onRejected: function () {
                    callback(onRejected);
                }
            });
        }
    });
};

// 添加catch方法
Promise.prototype.catch = function (onRejected) {
    // 直接返回then方法即可，第一个参数可写为undefined
    return this.then(undefined, onRejected);
};

// 添加resolve方法，注意该方法不是原型对象的，而是函数的方法
Promise.resolve = function (value) {
    // 该方法返回一个Promise对象
    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
            value.then(v => {
                resolve(v);
            }, r => {
                reject(r);
            });
        } else {
            resolve(value);
        }
    });
};

// 添加reject方法，和上边resolve一样
Promise.reject = function (reason) {
    // 不同的是，他永远返回一个失败的Promise
    return new Promise((resolve, reject) => {
        reject(reason);
    });
};

// 添加all方法，传入一个Promise数组，如果都是成功的则返回成功的新Promise，且值为所有Promise结果的数组。
// 有一个失败则返回一个失败的Promise
Promise.all = function (promises) {
    return new Promise((resolve, reject) => {
        let arr = [];
        let count = 0;
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(v => {
                // 这里最好不用push，因为可能有异步，不知道每个promise的执行顺序
                arr[i] = v;
                count++;
                // 每个都成功，才调用resolve修改状态
                if (count === promises.length) {
                    resolve(arr);
                }
            }, r => {
                // 有失败则直接调用reject
                reject(r);
            });
        }
    });
};

// 添加race方法，第一个完成的promise的状态就是结果状态
Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(v => {
                resolve(v);
            }, r => {
                reject(r);
            });
        }
    });
};