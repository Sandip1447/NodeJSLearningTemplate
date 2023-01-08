const path = require('path');

const express = require('express');

const productsController = require('../controllers/products')

const router = express.Router();

// Need to create a path for adding shop.html file from views folder
router.get('/', productsController.getProducts);

module.exports = router;