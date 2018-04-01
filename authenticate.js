/* We are gonna use this file to store the authentication strategies*/

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // This take care of the sessions???
passport.deserializeUser(User.deserializeUser());
