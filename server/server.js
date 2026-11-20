// Load environment variables from the .env file
require("dotenv").config();

// Import required libraries
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

// Create the Express application
const app = express();

// Set the server port
const PORT = process.env.PORT || 5000;

// Allow the server to receive JSON data
app.use(express.json());

// Configure sessions for user authentication
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax"
  }
}));

// Connect authentication routes
app.use("/api/auth", require("./routes/authRoutes"));

/// Connect photo routes to the server
app.use("/api/photos", require("./routes/photoRoutes"));

// Make uploaded images accessible through the browser
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Create a simple route to test the server
app.get("/", (req, res) => {
  res.send("Welcome to Alzikrayat Server!");
});

// Connect the application to MongoDB
mongoose
  .connect(process.env.MONGO_URI)

  // Start the server after connecting to the database
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })

  // Handle database connection errors
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });