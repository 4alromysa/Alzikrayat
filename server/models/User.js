// Import Mongoose to work with MongoDB
const mongoose = require("mongoose");

// Define the structure of a user document
const userSchema = new mongoose.Schema({

  // User's first name
  firstName: {
    type: String,
    required: true
  },

  // User's last name
  lastName: {
    type: String,
    required: true
  },

  // Email must be unique and in a valid format
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // Store the hashed password, not the original password
  // Hide the password from queries by default
  password: {
    type: String,
    required: true,
    select: false
  },

  // Optional user profile information
  location: String,
  description: String,
  occupation: String
});

// Create and export the User model
module.exports = mongoose.model("User", userSchema);