// Import Mongoose and the required database models
const mongoose = require("mongoose");
const Photo = require("../models/Photo");
const Comment = require("../models/Comment");

// Return comments for one photo, oldest first
const getPhotoComments = async (req, res) => {
  try {
    const photoId = req.params.id;

    // Reject invalid IDs before querying the database
    if (!mongoose.isValidObjectId(photoId)) {
      return res.status(400).json({ message: "Invalid photo ID" });
    }

    // Do not return comments for a photo that does not exist
    const photoExists = await Photo.exists({ _id: photoId });
    if (!photoExists) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Include the comment author's public name
    const comments = await Comment.find({ photoId })
      .populate("userId", "firstName lastName")
      .sort({ dateTime: 1, _id: 1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get comments" });
  }
};

// Add a comment from the currently logged-in user
const addPhotoComment = async (req, res) => {
  try {
    const photoId = req.params.id;

    // Validate the photo ID
    if (!mongoose.isValidObjectId(photoId)) {
      return res.status(400).json({ message: "Invalid photo ID" });
    }

    // Only accept a non-empty text comment
    const commentText = typeof req.body?.comment === "string"
      ? req.body.comment.trim()
      : "";
    if (!commentText) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Ensure the selected photo exists
    const photoExists = await Photo.exists({ _id: photoId });
    if (!photoExists) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Save the user's ID from the active session, not from the request body
    const newComment = await Comment.create({
      photoId,
      userId: req.session.userId,
      comment: commentText
    });

    // Return the saved comment with its author's public name
    await newComment.populate("userId", "firstName lastName");
    return res.status(201).json({
      message: "Comment added successfully",
      comment: newComment
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment" });
  }
};

// Delete a comment only if it belongs to the logged-in user
const deletePhotoComment = async (req, res) => {
  try {
    const { id: photoId, commentId } = req.params;

    // Validate both resource IDs before accessing MongoDB
    if (!mongoose.isValidObjectId(photoId) || !mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid photo or comment ID" });
    }

    // The comment must belong to the photo shown in the URL
    const comment = await Comment.findOne({ _id: commentId, photoId });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Never trust the client to decide comment ownership
    if (String(comment.userId) !== String(req.session.userId)) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};

// Export comment controller functions for the router
module.exports = { getPhotoComments, addPhotoComment, deletePhotoComment };
