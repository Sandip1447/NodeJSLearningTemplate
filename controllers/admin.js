const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
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
        console.log(err);
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
                prods: products, pageTitle: 'Admin Products', path: '/admin/products'
            });
        }).catch(err => {
        console.log(err);
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
                product: product
            });
        }).catch(err => {
        console.log(err);
    });
};


exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;

    Product.findById(prodId)
        .then(product => {

            if (product.userId !== req.user._id) {
                return res.redirect('/');
            }
            product.title = updatedTitle
            product.description = updatedDesc
            product.price = updatedPrice
            product.imageUrl = updatedImageUrl
            product.userId = req.user._id
            return product.save().then(result => {
                console.log('UPDATED PRODUCT!')
                res.redirect('/admin/products');

            })
        }).catch(err => {
        console.log(err)
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id})
        .then(result => {
            console.log('PRODUCT REMOVED!')
            res.redirect('/admin/products');
        }).catch(err => {
        console.log(err);
    });

};
