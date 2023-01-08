const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

// Need to create a path for adding shop.html file from views folder
router.get('/', (req, res, next) => {
    const products = adminData.products;
    console.log(products);
    res.render('shop', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true
    });
});

module.exports = router;