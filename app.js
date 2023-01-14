const path = require('path');

const mongoose = require("mongoose");

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error')

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
    User.findById("63c2b2911381f36649243b78")
        .then(user => {
            req.user = user;
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

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://node-learning:ghXeXmNN9QgFJyas@learning.viy5zbu.mongodb.net/shop?retryWrites=true&w=majority', {
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
                })
                user.save();
            }
        })
        app.listen(3000);
    }).catch(err => {
    console.log(err);
});
