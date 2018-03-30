var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';

const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connect correctly to server');
}, (err) => {console.log(err); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //this
app.use(cookieParser('12345-67890-09876-54321')); //this



function auth(req, res, next) {
  console.log(req.signedCookies);

  if(!req.signedCookies.user){
    var authHeader = req.headers.authorization;
    if(!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':') //This is spliting the string from the header which is the authentication message
    var username = auth[0];
    var password = auth[1];                                                          // the space is used to determine where we split the string
                                                              //So for example when the function finds white space it will split the message
    if(username === 'admin' && password === 'password'){        // and the second part of the message will go to [1]
      res.cookie('user', 'admin', {signed:true});                                                        // We are doing two splits here, the second is to split the username and password
      next(); // Allow the client request to pass to the next middleware
    }
    else{
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }
  else {
    if(req.signedCookies.user === 'admin'){
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }

}
app.use(auth);

app.use(express.static(path.join(__dirname, 'public'))); // express is using this to serve static data from our public folder
// This order has a big importance because every funciotn call is different middleware
app.use('/', indexRouter); // and this
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
