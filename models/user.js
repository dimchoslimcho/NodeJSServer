var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  firstname: {
    type:  String,
    default: ''
  },
  lastname: {
    type:  String,
    default: ''
  },
  facebookId: String, //will store the fb id of the user that has passed in the access token
  admin: {
    type: Boolean,
    default: false
  }
});

User.plugin(passportLocalMongoose);// When we use this it automaticly adds username and password fileds in our user schema

module.exports = mongoose.model('User', User);
