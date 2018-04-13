var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
/*corse.corseWithOptions even for the get here because the get
is profund by the admin here to other user will be allowed to perform that */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {

  User.register(new User({username:req.body.username}), req.body.password,
(err, user) =>  //we can use user.register because of mongoose passport
 {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else { // we are authenticating the same user which was registered
      if(req.body.firstname) user.firstname = req.body.firstname; // we want to make sure that the user is successfully registered
      if(req.body.lastname) user.lastname = req.body.lastname; // Thats why we do this parameter assignment after the authentication
      user.save((err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful'});
        });
      });
    }
  });
});


router.post ('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are logged in successfully!'});
});

router.get('/logout', cors.corsWithOptions, (req, res) => {
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

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) =>{ //when we call pass atuh fcb token  if successful would have loaded the user in the req object
  if(req.user) {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are logged in successfully!'});
  }
})

module.exports = router;
