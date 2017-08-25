var express = require("express"),
    router = express.Router({mergeParams: true});

var campground = require("../models/campground"),
    comment = require("../models/comment"),
    middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn , function(req,res){
    campground.findById(req.params.id, function(err, campground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.render("comments/new", {campground : campground});
        }
    })
});

router.post("/", middleware.isLoggedIn , function(req,res){
    campground.findById(req.params.id, function(err, campground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong, please try again")
                    res.redirect("/campgrounds/" + campground._id)
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.avatar = req.user.avatar;
                    comment.author.createdAt = req.user.createdAt;
                    comment.author.isAdmin = req.user.isAdmin;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Comment added");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//edit route
router.get("/:comment_id/edit" ,middleware.checkCommentOwnership, function(req,res){
    comment.findById(req.params.comment_id, function(err, fountComment){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: fountComment});
        }
    });
});
//update route
router.put("/:comment_id" ,middleware.checkCommentOwnership, function(req,res){
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
});

//destroy route
router.delete("/:comment_id" ,middleware.checkCommentOwnership, function(req,res){
    comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;
