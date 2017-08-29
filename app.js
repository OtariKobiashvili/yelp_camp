'use strict';

var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    user = require("./models/user"),
    campground = require("./models/campground"),
    comment = require("./models/comment"),
    port = process.env.PORT || 3000;

//require routes
var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index"),
    userRoutes = require("./routes/users"),
    ratingRoutes = require("./routes/ratings");

// load environment variables
require('dotenv').config()

var dbURI = process.env.DB_URI || 'mongodb://localhost/yelp_camp';

mongoose.Promise = global.Promise;
mongoose.connect(dbURI);
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.locals.moment = require('moment');

//PASSPORT config
app.use(require("express-session")({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/users", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/ratings", ratingRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(port, function(){
  console.log("Yelp Camp is now running on " + port);
}).on('error', function(e){
  console.log(e);
});
