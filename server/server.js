// Load environment variables from the .env file
require("dotenv").config();

// Import required libraries
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

// Create the Express application
const app = express();

// Set the server port
const PORT = process.env.PORT || 5000;

// Allow the server to read JSON request bodies
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

// Connect authentication routes to the server
app.use("/api/auth", require("./routes/authRoutes"));

// Define a simple route to test the server
app.get("/", (req, res) => {
  res.send("Welcome to Alzikrayat Server!");
});

// Connect to the MongoDB database
mongoose
  .connect(process.env.MONGO_URI)

  // Start the server only after connecting to MongoDB
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })

  // Display an error if MongoDB connection fails
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });