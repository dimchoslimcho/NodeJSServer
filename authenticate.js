/* We are gonna use this file to store the authentication strategies*/

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');
var config = require('./config');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // This take care of the sessions???
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user){
  return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // how the jwt should be extracted from the incoming request
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
(jwt_payload, done) =>{
  console.log("JWT payload", jwt_payload);
  User.findOne({_id: jwt_payload._id}, (err, user) => {
    if(err) {
      return done(err, false);
    }
    else if(user){
      return done(null, user);
    }
    else{
      return done(null, false);
    }
  });
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin = function(req, res, next) {
  if (req.user.admin){  //req.decoded kje postoi samo ako prethodno se vikne verify user t.e. decoded e del od tokenot shto se dobiva kako respons od prethodnata funkcija
    next();             //valjda user e tuka mesto req.decoded._doc
  }
  else{
    var err = new Error('You are not authorized to perform this opreation!');
    err.status = 403;
    return next(err);
  }
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
  clientID: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret    //->this function Here
},  (accessToken, refreshToken, profile, done) => {
  User.findOne({facebookId: profile.id}, (err, user) => {      //to see if this particular user has loged in earlier
    if(err) {
      return done(err, false); //done is the  call back function that comes is as the parameter to ->
    }
    if(!err && user !== null){
      return done(null, user);
    }
    else {
      user = new User({username: profile.displayName});
      user.facebookId = profile.id;
      user.firstname = profile.name.givenName;
      user.lastname = profile.name.familyName;
      user.save((err, user) => {
        if(err){
          return done(err, false);
        }
        else return done(null, user);
      })
    }
  });
}

));
