const products = [];

module.exports = class Product {
    constructor(t) {
        this.titile = t;
    }

    save() {
        products.push(this);
    }

    static fetchAll() {
        return products;
    }
}