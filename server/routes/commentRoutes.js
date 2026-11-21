// Import Express and comment controller functions
const express = require("express");
const { getPhotoComments, addPhotoComment, deletePhotoComment } = require("../controllers/commentController");

// Preserve the photo ID passed by the parent photo router
const router = express.Router({ mergeParams: true });

// Allow only logged-in users to write comments
const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Please login first" });
  }
  next();
};

// Anyone can read comments; only logged-in users can add them
router.get("/", getPhotoComments);
router.post("/", requireLogin, addPhotoComment);

// Only the author can delete a comment; ownership is checked in the controller
router.delete("/:commentId", requireLogin, deletePhotoComment);

// Export nested routes for /api/photos/:id/comments
module.exports = router;
