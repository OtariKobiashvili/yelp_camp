var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
  text: String,
  created: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    username: String,
    avatar: String,
    createdAt: Date,
    isAdmin: Boolean
  }
});

module.exports = mongoose.model("Comment", commentSchema);
