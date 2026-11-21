
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Joi = require("joi");

// Validate registration data before creating a user
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  location: Joi.string().trim().allow("").optional(),
  description: Joi.string().trim().allow("").optional(),
  occupation: Joi.string().trim().allow("").optional()
});

// Validate login credentials
const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required()
});

// Register a new user and start a session
const registerUser = async (req, res) => {
  try {
    // Check the submitted registration data
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    // Use the validated and normalized values
    const {
      firstName,
      lastName,
      email,
      password,
      location,
      description,
      occupation
    } = value;

    // Check whether the email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      location,
      description,
      occupation
    });

    // Start an authenticated session
    req.session.userId = user._id.toString();

    return res.status(201).json({
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

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};

// Authenticate an existing user and start a session
const loginUser = async (req, res) => {
  try {
    // Check the submitted login data
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find the account and include the hashed password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare the submitted password with the stored hash
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Start an authenticated session
    req.session.userId = user._id.toString();

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed"
    });
  }
};

// Return the current user when a session exists
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "Please login"
      });
    }

    const user = await User.findById(
      req.session.userId
    ).select("firstName lastName email");

    if (!user) {
      return res.status(401).json({
        message: "Please login"
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not check session"
    });
  }
};

// Destroy the authenticated session
const logoutUser = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid");

    return res.status(200).json({
      message: "Logout successful"
    });
  });
};

// Export authentication controller functions
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
};
