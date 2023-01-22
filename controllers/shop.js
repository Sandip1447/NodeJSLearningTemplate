const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product')
const Order = require('../models/order')

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            // console.log(products);
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        }).catch(err => {
        console.log(err);
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });
}

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            // console.log(products);
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        }).catch(err => {
            console.log(err);
            const error = new Error(err);
            err.httpStatusCode = 500
            return next(error)
        }
    );

}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        }).catch(err => {
        console.log(err);
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });
}


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        }).catch(err => {
        console.log(err);
    });

};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            console.log(user.cart.items)
            const products = user.cart.items;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
            });
        }).catch(err => {
        console.log(err);
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteItemFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        }).catch(err => {
        console.log(err);
    })
};

exports.postOrder = (req, res, next) => {

    req.user
        .populate('cart.items.productId')
        .then(user => {
            console.log(user.cart.items)
            const products = user.cart.items.map(i => {
                return {
                    quantity: i.quantity, product: {...i.productId._doc}
                }
            });
            const order = new Order(
                {
                    products: products,
                    user: {
                        name: req.user.name,
                        userId: req.user
                    }
                }
            );
            return order.save()
        }).then(result => {
        return req.user.clearCart();
    }).then(() =>
        res.redirect('/orders')
    ).catch(err => {
        console.log(err)
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });
}

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err);
            err.httpStatusCode = 500
            return next(error)
        });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
   // console.log(orderId)
    Order.findById(orderId)
        .then(order => {
           // console.log(order)
            if (!order) {
                return next(new Error('No order found.'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });
            pdfDoc.text('-----------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc
                    .fontSize(14)
                    .text(
                        prod.product.title +
                        ' - ' +
                        prod.quantity +
                        ' x ' +
                        '$' +
                        prod.product.price
                    );
            });
            pdfDoc.text('---');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

            pdfDoc.end();
        })
        .catch(err => {
            console.log(err)
            next(err)
        });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
}




