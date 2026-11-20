// Import the User model
const User = require("../models/User");

// Import bcrypt to hash and verify passwords
const bcrypt = require("bcrypt");

// Register a new user
const registerUser = async (req, res) => {
  try {

    // Get user information from the request body
    const {
      firstName, lastName, email, password,
      location, description, occupation
    } = req.body;

    // Check that all required fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Required fields are missing"
      });
    }

    // Require a password of at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Normalize the email before searching or saving
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether this email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user in MongoDB
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      location,
      description,
      occupation
    });

    // Store the user's ID in the login session
    req.session.userId = user._id.toString();

    // Send a success response without exposing the password
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {

    // Handle duplicate email errors from MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Handle unexpected registration errors
    res.status(500).json({
      message: "Registration failed"
    });
  }
};

// Log in an existing user
const loginUser = async (req, res) => {
  try {

    // Read login credentials from the request
    const { email, password } = req.body;

    // Check that both credentials are provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find the user and explicitly include the password hash
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    // Reject login if the email is not registered
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare the entered password with the saved hash
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    // Reject login if the password does not match
    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Save the logged-in user's ID in the session
    req.session.userId = user._id.toString();

    // Return user information without the password hash
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {

    // Handle unexpected login errors
    res.status(500).json({
      message: "Login failed"
    });
  }
};

// Export authentication functions for use in routes
module.exports = {
  registerUser,
  loginUser
};