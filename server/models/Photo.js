// Import Mongoose
const mongoose = require("mongoose");

// Define the structure of a photo document
const photoSchema = new mongoose.Schema({

  // The user who uploaded the photo
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Name of the stored image file
  fileName: {
    type: String,
    required: true
  },

  // Photo title
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Optional photo description
  description: {
    type: String,
    default: ""
  },

  // Upload date and time
  dateTime: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Photo model
module.exports = mongoose.model("Photo", photoSchema);
