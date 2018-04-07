var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');



var index = require('./routes/index');
var users = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');


const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Dishes = require('./models/dishes');

const url = config.mongoUrl;

const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connect correctly to server');
}, (err) => {console.log(err); });

var app = express();

app.all('*', (req, res, next) => {
  if(req.secure) {
    return next();
  }
  else{
    res.redirect(307,  'https://'+req.hostname+ ':' +app.get('secPort') + req.url); //redirectin to https
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false })); //this
//app.use(cookieParser('12345-67890-09876-54321')); //this
/*app.use(session({ //using this code we are saving the session
  name: 'session_id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));*/
app.use(passport.initialize());


app.use('/', index); // we are first singing up and after that the auth process is completed not vice versa
app.use('/users', users); //this two must be here



app.use(express.static(path.join(__dirname, 'public'))); // express is using this to serve static data from our public folder
// This order has a big importance because every funciotn call is different middleware
/*app.use('/', indexRouter);    //if this two methods(the one below) stay here the app.js wont work the must go before the auth method the
app.use('/users', usersRouter);*/
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
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
