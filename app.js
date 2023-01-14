const path = require('path');

const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error')

const mongoConnect = require('./util/datatbase').mongoConnect;
const User = require('./models/user')

//Adding path route
const rootDir = require('./util/path')

const app = express();

// Template engine (Working with ejs)
app.set('view engine', 'ejs');
app.set('views', 'views');


// manually created routes need to below the app object
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')


//Adding body parser
app.use(express.urlencoded({extended: true}))
// serving files statically
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
    User.findById("63c2721af1b1a6917c2cf2ff")
        .then(user => {
            req.user = new User(
                user._id,
                user.name,
                user.email,
                user.cart
            );
            next()
        }).catch(err => {
        console.log(err)
    })
})

/*
*
* Adding middleware
* After create an app object */

// Request goes to the files top to bottom so we are added this route here.
// Added filter with admin
app.use('/admin', adminRoutes);
app.use(shopRoutes);

//Adding 404 page error page
app.use(errorController.get404);

/*
* END before server object
* */

mongoConnect(() => {
    app.listen(3000);
})

