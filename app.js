const path = require('path');

const http = require('http');

const express = require('express');
const bodyParser = require('body-parser');

//Adding path route
const rootDir = require('./util/path')

const app = express();

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
    // res.status(404).send('<h1> Page not fount.</h1>')
    res.status(404).sendFile(path.join(rootDir, 'views', '404.html'))
});

/*
* END before server object
* */

app.listen(3000);
