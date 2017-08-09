//SCHEMA Setup
var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    location: String,
    lat: Number,
    lng: Number,
    description: String,
    created: { type: Date, default: Date.now },
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },
      username: String
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
});

module.exports = mongoose.model("Campground", campgroundSchema);
