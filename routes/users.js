var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware");


var campground = require("../models/campground"),
    user = require("../models/user");

router.get("/:id", function(req, res) {
  console.log(req.params.id)
  user.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong: " + err);
      res.redirect("/")
    }
    campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong: " + err);
        res.redirect("/")
      }
      console.log(campgrounds)
      res.render("users/show", { user : foundUser, campgrounds: campgrounds})
    });
  });
});


module.exports = router;
