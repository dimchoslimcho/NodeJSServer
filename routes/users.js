var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');


var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {

  User.findOne({username:req.body.username}) //Checking if already exist this user
  .then((user) => {
    if(user != null) {
      var err = new Error('User '+req.body.username+' already exsists!');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password:  req.body.password
      });
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req, res, next) => {
  if(!req.session.user){
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

    User.findOne({username: username})
    .then((user) => {
      if(user.username === username && user.password === password){        // and the second part of the message will go to [1]
        req.session.user = 'authenticated';                                                        // We are doing two splits here, the second is to split the username and password
        res.statusCode = 200; // Allow the client request to pass to the next middleware
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are autheticated!');
      }
      else if(user.password !== password){
        var err = new Error('Your password is incorect!');
        err.status = 403;
        return next(err);
      }
      else if(user === null){
        var err = new Error('User '+username+' does not exist');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
      }
    })
    .catch((err) => next(err));                                                          //So for example when the function finds white space it will split the message
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

router.get('/logout', (req, res) => {
  if(req.session){
    req.session.destroy();
    res.clearCookie('session_id') // A way of asking the client to remove the cookie
    res.redirect('/');
  }
  else{
    var err = new Error('You are not logged in!');
    err.status = 403; //Frobiden operation
    next(err);
  }
});

module.exports = router;
