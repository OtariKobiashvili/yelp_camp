var express = require("express"),
    router = express.Router(),
    geocoder = require("geocoder");

var campground = require("../models/campground"),
    middleware = require("../middleware");

router.get("/", function(req,res){
    //get all campgrounds then render
    campground.find({}, function (err, allCampgrounds) {
        if(err){
            req.flash("error", "Campgrounds not found");
            res.redirect("/");
        } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds, page:"campgrounds"});
        }
    });
});

//NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

//CREATE
router.post("/", middleware.isLoggedIn, function(req,res){
    // get data from form and add to campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function(err, data){
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
        //create new campground, save to DB
        campground.create(newCampground, function(err, newlyCreated){
            if(err){
                req.flash("error", err.message);
                res.redirect("/campgrounds");
            } else {
                //redirect back to campgrounds page
                req.flash("succes", "Added new campground:" + newCampground.name);
                res.redirect("/campgrounds");
            }
        });
    });
});

//SHOW - show more info about campground
router.get("/:id", function(req, res){
    //find campground with provided id,
    campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//Edit campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//update campground

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//destroy campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground deleted")
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;
