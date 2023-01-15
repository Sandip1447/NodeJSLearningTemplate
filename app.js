const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
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

// Template engine (Working with ejs)
app.set('view engine', 'ejs');
app.set('views', 'views');


// manually created routes need to below the app object
const adminRoutes = require('./routes/admin')
const authRoutes = require('./routes/auth')
const shopRoutes = require('./routes/shop')


//Adding body parser
app.use(express.urlencoded({extended: true}))
// serving files statically
app.use(express.static(path.join(rootDir, 'public')))

//Handle session
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
    store: store
}))

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
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

//Adding 404 page error page
app.use(errorController.get404);

/*
* END before server object
* */

mongoose.set('strictQuery', false);
mongoose.connect(
    process.env.MONGODB_URL, {
    useNewUrlParser: true
})
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                // Create a new user
                const user = new User({
                    name: 'Pooja',
                    email: 'pooja@node.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    }).catch(err => {
    console.log(err);
});
