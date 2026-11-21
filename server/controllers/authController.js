// Import the User model and password hashing library
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Register a new user and start a session
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, location, description, occupation } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email: normalizedEmail, password: hashedPassword, location, description, occupation });
    req.session.userId = user._id.toString();
    return res.status(201).json({ message: "Registration successful", user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Email already registered" });
    return res.status(500).json({ message: "Registration failed" });
  }
};

// Authenticate an existing user and start a session
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });
    req.session.userId = user._id.toString();
    return res.status(200).json({ message: "Login successful", user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

// Return the current user's public information when a session exists
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ message: "Please login" });
    const user = await User.findById(req.session.userId).select("firstName lastName email");
    if (!user) return res.status(401).json({ message: "Please login" });
    return res.status(200).json({ user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: "Could not check session" });
  }
};

// Destroy the session on the server, not just in React state
const logoutUser = (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
};

// Export authentication route handlers
module.exports = { registerUser, loginUser, getCurrentUser, logoutUser };
