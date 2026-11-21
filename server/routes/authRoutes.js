// Import Express to create API routes
const express = require("express");
const router = express.Router();

// Import authentication functions from the controller
const { registerUser, loginUser, getCurrentUser, logoutUser } = require("../controllers/authController");

// Register and log in users
router.post("/register", registerUser);
router.post("/login", loginUser);

// Check the current session and sign out
router.get("/me", getCurrentUser);
router.post("/logout", logoutUser);

// Export routes to connect them to the main server
module.exports = router;
