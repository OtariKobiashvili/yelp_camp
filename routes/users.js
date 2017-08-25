var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware");


var campground = require("../models/campground"),
    user = require("../models/user");

router.get("/:id", function(req, res) {
  user.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong");
      return res.redirect("/campgrounds");
    }
    campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong: " + err);
        return res.redirect("/campgrounds");
      }
      res.render("users/show", { user : foundUser, campgrounds: campgrounds})
    });
  });
});

//get edit form
router.get("/:id/edit", middleware.checkProfileOwnership, function(req, res) {
  user.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong: " + err);
      return res.redirect(".");
    }
    res.render("users/edit", {user: foundUser});
  });
});

//put request
router.put("/:id", middleware.checkProfileOwnership, middleware.checkNudity, function(req, res) {
  var dataToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar,
    description: req.body.description
  }
  user.findByIdAndUpdate(req.params.id, {$set: dataToUpdate}, function(err, updatedUser) {
    if(err) {
      req.flash("error", err.message);
      res.redirect("/users/" + req.params.id);
    } else {
      req.flash("success", "Successfully updated your profile.");
      res.redirect("/users/" + req.params.id);
    }
  })
})

module.exports = router;
