const express = require('express');
const {check, body} = require('express-validator')
const authController = require('../controllers/auth');
const User = require("../models/user");

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', [
    body('email', 'Please enter valid email')
        .normalizeEmail(),
    body('password', 'Please enter a valid password.')
        .isLength({min: 8})
        .isAlphanumeric()
        .trim(),
], authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', [check('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .custom((value, {req}) => {
            return User.findOne({email: value}).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('The email address is already subscribed.')
                }
            })
        })
        .normalizeEmail(),
        body('password',
            'Please enter a password with only numbers and text and at least 8 characters.')
            .isLength({min: 8})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, {req}) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match!')
                }
                return true;
            })
    ],
    authController.postSignup);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/new-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

router.post('/logout', authController.postLogout);

module.exports = router;