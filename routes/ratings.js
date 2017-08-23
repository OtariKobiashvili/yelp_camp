var express = require("express"),
    router  = express.Router({mergeParams: true});


var campground = require("../models/campground"),
    rating = require("../models/rating"),
    middleware = require("../middleware");

router.get("/", function(req,res) {
  campground.findById(req.params.id, function(err, foundCampground) {
    return res.json(foundCampground.rating);
  });
});

router.post("/", middleware.isLoggedIn, function(req, res) {
  campground.findById(req.params.id, function(err, foundCampground) {
    if(err) {
      req.flash("error", "Something went wrong, please try again.");
      return res.redirect(".")
    } else if(req.body.rating) {
      rating.create({rating:req.body.rating}, function(err, rating) {
        if(err) {
          req.flash("error", "Something went wrong, please try again.");
          return res.redirect(".")
        }
        rating.author.id = req.user._id;
        rating.author.username = req.user.username;
        rating.save();
        foundCampground.ratings.push(rating);
				foundCampground.save();
      })
    }
    return res.sendStatus(200);
  })
});

module.exports = router;
