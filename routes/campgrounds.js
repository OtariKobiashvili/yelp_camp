var express = require("express"),
    router = express.Router(),
    geocoder = require("geocoder");

var campground = require("../models/campground"),
    user = require("../models/user"),
    middleware = require("../middleware");

router.get("/", function(req,res){
    //if theres is a search respond with campgrounds that match the search by name
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        //Check to see what search is, if its empty, return all campgrounds
        if(regex == "/all/gi"){
            campground.find({}, function(err, allCampgrounds){
                if(err){
                    req.flash("error", "Something went wrong: " + err.message)
                    res.redirect("back");
                } else {
                    return res.json(allCampgrounds);
                }
            });
        } else {
            campground.find({ name: regex }, function(err, allCampgrounds){
                if(err){
                    req.flash("error", "Something went wrong: " + err.message)
                    res.redirect("back");
                } else {
                    return res.json(allCampgrounds);
                }
            });
        }

    } else {
        //else works as a normal route that render the index template
        campground.find({}, function (err, allCampgrounds) {
            if(err){
                req.flash("error", "Campgrounds not found");
                res.redirect("/");
            } else {
                res.render("campgrounds/index",{campgrounds:allCampgrounds, page:"campgrounds"});
            }
        });
    }
});

//NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

//CREATE
router.post("/", middleware.isLoggedIn, middleware.isSafe, function(req,res){
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
        if(data.results.length < 1){
            req.flash("error","Please enter a valid location");
            return res.redirect("/campgrounds/new");
        }
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
    campground.findById(req.params.id).populate("comments").populate("ratings").exec(function(err, foundCampground){
        var isAjax = req.xhr;
        if(err){
            req.flash("error", "No campground found.");
            res.redirect("/campgrounds");
        } else {
            if(foundCampground.ratings.length > 0) {
              var ratings = [];
              var length = foundCampground.ratings.length;
              foundCampground.ratings.forEach(function(rating) {
                ratings.push(rating.rating)
              });
              var rating = ratings.reduce(function(total, element) {
                return total + element;
              });
              foundCampground.rating = rating / length;
              foundCampground.save();
            }
            if(isAjax) {
                return res.json(foundCampground.rating);
            }
            //for each comment, find the author by id, then update the authors avatar
            foundCampground.comments.forEach(function(comment) {
                user.findById(comment.author.id, function(err, foundUser) {
                    if(err) {
                        req.flash("error", "Something went wrong: " + err.message);
                        return res.redirect("/campgrounds");
                    }
                    comment.author.avatar = foundUser.avatar;
                    foundCampground.save();
                });
            });
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

router.put("/:id", middleware.checkCampgroundOwnership, middleware.isSafe, function(req, res){
  geocoder.geocode(req.body.campground.location, function (err, data) {
    if(data.results.length < 1){
        req.flash("error","Please enter a valid location");
        return res.redirect("/campgrounds/new");
    }
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
    campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
