// all the middleware goes in here
var campground = require("../models/campground"),
    comment = require("../models/comment"),
    user = require("../models/user"),
    middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect(".");
            } else if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "You dont have permission to do that")
                res.redirect(".");
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect(".");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
//is user logged in
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect(".");
                //does user own found comment?
            } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect(".");
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect(".");
    }
}

middlewareObj.checkProfileOwnership = function(req, res, next){
//is user logged in
    if(req.isAuthenticated()){
        user.findById(req.params.id, function(err, foundUser){
            console.log(foundUser)
            console.log(req.user)
            if(err){
                res.redirect(".");
                //does user own found comment?
            } else if(foundUser._id.equals(req.user._id)){
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect(".");
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect(".");
    }
}

middlewareObj.isSafe = function(req, res, next) {
    if(req.body.image.match(/^https:\/\/images\.unsplash\.com\/.*/)) {
      next();
    } else {
      req.flash("error", "Only images from images.unsplash.com allowed.\nSee https://youtu.be/Bn3weNRQRDE for how to copy image urls from unsplash.");
      res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj
