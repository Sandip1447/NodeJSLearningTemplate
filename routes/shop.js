const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop')

const router = express.Router();

// Need to create a path for adding shop.html file from views folder
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/checkout', shopController.getCheckout);

module.exports = router;