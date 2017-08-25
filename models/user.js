var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  avatar: {type: String, default: "https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png"},
  firstName: {type: String, default: "First Name"},
  lastName: {type: String, default: "Last Name"},
  email: {type: String, default: "email@gmail.com"},
  description: {type: String, default: "Edit your profile to add a description about you."},
  createdAt: {type:Date, default: Date.now},
  isAdmin: {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
