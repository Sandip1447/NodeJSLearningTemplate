const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

// Share data across the request & users
const products = [];

/*
*  Adding filter path
* */

// admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        formsCss: true,
        productCSS: true,
        activeAddProduct: true
    });
});

// admin/add-product => POST
router.post('/add-product', (req, res, next) => {
    products.push({title: req.body.title});
    res.redirect('/');
});

//Change the export little bit
exports.routes = router;
exports.products = products;