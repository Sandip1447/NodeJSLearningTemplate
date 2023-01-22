const Product = require('../models/product')
const {validationResult} = require('express-validator')
const fileHelper = require('../util/file')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const errors = validationResult(req);

    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                description: description,
                price: price,
            },
            errorMessage: 'Attached file is not supported.',
            validationErrors: errors.array()
        });
    }
    console.log(image)
    const imageUrl = '/' + image.path
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                description: description,
                price: price,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price,
        userId: req.user
    })

    product.save()
        .then(result => {
            console.log(result)
            console.log('created product');
            res.redirect('/admin/products');
        }).catch(err => {
        // console.log(err);
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });

}

exports.getProducts = (req, res, next) => {
    Product.find({
        userId: req.user._id
    })
        // .populate('userId')
        .then(products => {
            console.log(products);
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',

            });
        }).catch(err => {
        console.log(err);
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });
}


exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        }).catch(err => {
        console.log(err);
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });
};


exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);

    let updatedImagePath;

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                _id: prodId,
                title: updatedTitle,
                description: updatedDesc,
                price: updatedPrice,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle
            product.description = updatedDesc
            product.price = updatedPrice
            if (!image) {
                fileHelper.deleteFile(product.imageUrl)
                updatedImagePath = '/' + image.path
                product.imageUrl = updatedImagePath
            }
            product.userId = req.user._id
            return product.save().then(result => {
                console.log('UPDATED PRODUCT!')
                res.redirect('/admin/products');

            })
        }).catch(err => {
        // console.log(err)
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => {
        if (!product) {
            return next(new Error('Product not found.'))
        }
        fileHelper.deleteFile(product.imageUrl)
        return Product.deleteOne({_id: prodId, userId: req.user._id});
    }).then(() => {
        console.log('PRODUCT REMOVED!')
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });

};
