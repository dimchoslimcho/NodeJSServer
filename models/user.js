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
  admin: {
    type: Boolean,
    default: false
  }
});

User.plugin(passportLocalMongoose);// When we use this it automaticly adds username and password fileds in our user schema

module.exports = mongoose.model('User', User);
