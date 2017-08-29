// all the middleware goes in here
var campground = require("../models/campground"),
    comment = require("../models/comment"),
    user = require("../models/user"),
    middlewareObj = {},
    sightengine = require('sightengine')('1808369786', 'rvhY88nejvouTY3CB9rP');


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

middlewareObj.checkNudity = function(req, res, next) {
    if(checkURL(req.body.avatar)) {
        sightengine.check(['nudity']).set_url(req.body.avatar).then(function(result) {
            var nudityScore = result.nudity.raw
            var safeScore = result.nudity.safe
            if(nudityScore < .20 || safeScore > .50) {
                next();
            } else {
                req.flash("error", "No nudity allowed, please try again with an appropiate image." );
                res.redirect("back");
            }
        }).catch(err => {
            if(err) {
                req.flash("error", "You can not edit your profile at this time.");
                res.redirect("back");
            }
        });
    } else {
        req.flash("error", "Please use a JPG image.")
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

//check to make sure img is a jpg
function checkURL(url) {
    return(url.match(/\.(jpg)$/) != null);
}

module.exports = middlewareObj
