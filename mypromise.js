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
    const self = this;
    // then应该返回一个Promise对象，并且这个对象的状态由回调函数执行的结果确定
    return new Promise((resolve, reject) => {
        // 先判断状态，这里this指向调用then的实例p。虽然在新构造函数中，但this仍指向调用then的实例p
        if (this.PromiseState === 'fulfilled') {
            try {
                // 调用成功时的函数，并把值（即上面的形参data）传进去
                // 用result接收回调函数执行的结果
                let result = onResolved(this.PromiseResult);
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
        if (this.PromiseState === 'rejected') {
            onRejected(this.PromiseResult);
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
                    try {
                        // 这里不能用this，因为这是对象中的方法，会指向这个对象
                        let result = onResolved(self.PromiseResult);
                        // 这里进行判断，与上边一样，回调函数的结果决定then返回的Promise对象状态
                        if (result instanceof Promise) {
                            result.then(v => {
                                resolve(v);
                            }, r => {
                                reject(r);
                            });
                        } else {
                            resolve(result);
                        }
                    } catch (e) {
                        reject(e);
                    }
                },
                onRejected: function () {
                    try {
                        let result = onRejected(self.PromiseResult);
                        if (result instanceof Promise) {
                            result.then(v => {
                                resolve(v);
                            }, r => {
                                reject(r);
                            });
                        } else {
                            resolve(result);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        }
    });
};