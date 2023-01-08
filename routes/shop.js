const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

// Need to create a path for adding shop.html file from views folder
router.get('/', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;