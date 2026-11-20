// Import Express to create API routes
const express = require("express");

// Create a router for authentication requests
const router = express.Router();

// Import authentication functions from the controller
const {
  registerUser,
  loginUser
} = require("../controllers/authController");

// Handle new user registration requests
router.post("/register", registerUser);

// Handle existing user login requests
router.post("/login", loginUser);

// Export routes to connect them to the main server
module.exports = router;