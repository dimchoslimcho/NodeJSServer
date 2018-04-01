var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');


var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {

  User.register(new User({username:req.body.username}), req.body.password,
(err, user) =>  //we can use user.register because of mongoose passport
 {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else { // we are authenticating the same user which was registered
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful'});
      });
    }
  });
});


router.post ('/login', passport.authenticate('local'), (req, res, next) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are logged in successfully!'});
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
