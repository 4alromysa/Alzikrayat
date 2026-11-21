// Import Mongoose to define the comment schema
const mongoose = require("mongoose");

// Each comment belongs to one photo and one user
const commentSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Photo",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  dateTime: {
    type: Date,
    default: Date.now
  }
});

// Export the Comment model for the controller
module.exports = mongoose.model("Comment", commentSchema);
