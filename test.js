function a() {
    this.name = a;
}

function b() {
    this.name = b;
}

a.m = function () {
    return new b(
        () => {
            console.log(this);
        }
    );
};

a.m();