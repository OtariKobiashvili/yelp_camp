var express = require("express"),
    router = express.Router();

var campground = require("../models/campground"),
    middleware = require("../middleware")

router.get("/", function(req,res){
    //get all campgrounds then render
    console.log(req.user);
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
    var newCampground = {name:name, price:price, image:image, description:desc, author:author};
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
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
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
