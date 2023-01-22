const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto')
const {validationResult} = require('express-validator')

const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "a95d558a6ff24d",
        pass: "fb8420ce9e2f69"
    }
});
exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                }).catch(err => {
                console.log(err)
            })

        })
        .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    });
};

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                name: name,
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    bcrypt.hash(password, 12) // encrypted password
        .then(securedPassword => {
            const user = User({
                name: name,
                email: email,
                password: securedPassword,
                cart: {
                    items: []
                }
            });
            return user.save();
        }).then(result => {
        console.log('USER CREATED!')
        res.redirect('/login')

        transporter.sendMail({
            to: email,
            from: 'test@noreply.com',
            subject: 'Signup succeeded.',
            html: `
                <p>You successfully signup.</p>
                `
        }, (err, info) => {
            if (err) {
                console.log(err)
                const error = new Error(err);
                err.httpStatusCode = 500
                return next(error)
            } else {
                console.log(info);
            }
        });
    }).catch(err => {
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    });
}

exports.getResetPassword = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset-password', {
        path: '/reset-password',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
};

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset-password');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user => {
                if (!user) {
                    return res.redirect('/reset-password');
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            }).then(result => {
            res.redirect('/login');
            transporter.sendMail({
                to: req.body.email,
                from: 'test@yopmail.com',
                subject: 'Reset password',
                html: `
                <p>You requested password request.</p>
                <p>Click this <a href="http://127.0.0.1:3000/new-password/${token}"> link</a>to set a new password.</p>
                `
            }, (err, info) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info);
                }
            });
        }).catch(err => {
            console.log(err)
            const error = new Error(err);
            err.httpStatusCode = 500
            return next(error)
        })

    })

};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {$gt: Date.now()}
    }).then(user => {
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'Set New Password',
            userId: user._id.toString(),
            passwordToken: token,
            errorMessage: message
        });
    }).catch(err => {
        console.log(err)
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    })
};

exports.postNewPassword = (req, res, next) => {
    const password = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    }).then(user => {
        resetUser = user;
        return bcrypt.hash(password, 12) // encrypted password
            .then(securedPassword => {
                resetUser.password = securedPassword;
                resetUser.resetToken = undefined;
                resetUser.resetTokenExpiration = undefined;
                return resetUser.save();
            })
    }).then(result => {
        console.log('USER PASSWORD UPDATED!')
        res.redirect('/login');
        transporter.sendMail({
            to: resetUser.email,
            from: 'test@yopmail.com',
            subject: 'Password updated.',
            html: `
                <p>Your password is updated.</p>
                `
        }, (err, info) => {
            if (err) {
                console.log(err)
            } else {
                console.log(info);
            }
        });
    }).catch(err => {
        console.log(err)
        const error = new Error(err);
        err.httpStatusCode = 500
        return next(error)
    })
};


exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};
