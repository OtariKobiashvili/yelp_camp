var express= require("express"),
    router = express.Router(),
    passport = require("passport"),
    user = require("../models/user");

var middleware = require("../middleware");

router.get("/", function(req,res){
    res.render("landing");
});

router.get("/register", function(req,res){
    res.render("register", { page: "register"});
});

//handle sign up logic
router.post("/register", function(req,res){
    var newUser = new user({username: req.body.username});
    user.register(newUser, req.body.password, function(err, user){
        if(err) {
            return res.render("register", { "error": err.message });
        }
        passport.authenticate("local")(req,res, function(){
            req.flash("success", "Welcome to Yelp Camp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//show log in form
router.get("/login", function(req,res){
    res.render("login", {page: "login"});
});
//handle login logic
router.post("/login",passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: "Invalid username or password, please try again"
}), function(req,res){
    req.flash("success", "Logged you in");
    res.redirect("/campgrounds");
});

//logout logic
router.get("/logout", middleware.isLoggedIn, function(req,res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});

module.exports = router;
