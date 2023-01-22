const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const csrf = require('csurf');
const flash = require('connect-flash')
const multer = require('multer')

const express = require('express');

const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const errorController = require('./controllers/error')
const User = require('./models/user')
//Adding path route
const rootDir = require('./util/path')

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    collection: 'sessions'
});
// setup route middlewares
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg'
    ) {
        // To accept the file pass `true`, like so:
        cb(null, true)

    } else {
        // To reject this file pass `false`, like so:
        cb(null, false)
    }


}
const upload = multer({storage: fileStorage, fileFilter: fileFilter})


// Template engine (Working with ejs)
app.set('view engine', 'ejs');
app.set('views', 'views');


// manually created routes need to below the app object
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth')
const shopRoutes = require('./routes/shop')


//Adding body parser
app.use(express.urlencoded({extended: true}))
app.use(upload.single('image'))
// serving files statically
app.use(express.static(path.join(rootDir, 'public')))
app.use('/uploads',express.static(path.join(rootDir, 'uploads')))

//Handle session
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
    store: store
}))
//After session secure csurf token
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err))
        });
});


/*
*
* Adding middleware
* After create an app object */

// Request goes to the files top to bottom so we are added this route here.
// Added filter with admin
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

//Adding 404 page error page
app.use(errorController.get404);
app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    })
})

/*
* END before server object
* */

mongoose.set('strictQuery', false);
mongoose.connect(
    process.env.MONGODB_URL, {
        useNewUrlParser: true
    })
    .then(result => {
        app.listen(3000);
    }).catch(err => {
    console.log(err);
});
