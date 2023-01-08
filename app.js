const path = require('path');

const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');

//Adding path route
const rootDir = require('./util/path')

const app = express();

// Template engine (Working with ejs)
app.set('view engine', 'ejs');
app.set('views', 'views');


// manually created routes need to below the app object
const adminData = require('./routes/admin')
const shopRoutes = require('./routes/shop')


//Adding body parser
app.use(express.urlencoded({extended: true}))
// serving files statically
app.use(express.static(path.join(rootDir, 'public')))


/*
*
* Adding middleware
* After create an app object */

// Request goes to the files top to bottom so we are added this route here.
// Added filter with admin
app.use('/admin', adminData.routes);
app.use(shopRoutes);

//Adding 404 page error page
app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page Not Found'})
});

/*
* END before server object
* */

app.listen(3000);
