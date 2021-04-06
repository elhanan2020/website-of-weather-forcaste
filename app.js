const bodyParser = require('body-parser');
const session = require('express-session');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const productsController = require('./controller/SignIn');
var adminRoutes = require('./routes/admin');
var weatherRoutes = require('./routes/api');
const errorController = require('./controller/error');
var app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret:"keyboard cat",
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false },
    alreadyExist:false
}));

app.get('/', productsController.log);

app.use('/register', adminRoutes);

app.use('/api', weatherRoutes);

app.use(errorController.get404);

module.exports = app;
