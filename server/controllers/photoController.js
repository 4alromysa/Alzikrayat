
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const Joi = require("joi");

// Import the Photo model
const Photo = require("../models/Photo");

// Validate photo details before saving
const photoSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  description: Joi.string().trim().allow("").optional()
});

// Remove an image file from the uploads folder
const removeImage = async (fileName) => {
  const filePath = path.join(
    __dirname,
    "../uploads",
    path.basename(fileName)
  );

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Image deletion failed:", error.message);
    }
  }
};

// Get all uploaded photos
const getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find()
      .populate("userId", "firstName lastName")
      .sort({ dateTime: -1 });

    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get photos"
    });
  }
};

// Get a single photo by its ID
const getPhotoById = async (req, res) => {
  try {
    // Check whether the supplied ID is valid
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid photo ID"
      });
    }

    // Search for the requested photo
    const photo = await Photo.findById(req.params.id)
      .populate("userId", "firstName lastName");

    if (!photo) {
      return res.status(404).json({
        message: "Photo not found"
      });
    }

    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get photo"
    });
  }
};

// Upload a new photo
const uploadPhoto = async (req, res) => {
  try {
    // Make sure an image was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required"
      });
    }

    // Validate the submitted photo details
    const { error, value } = photoSchema.validate(req.body);

    if (error) {
      // Remove the uploaded file when validation fails
      await removeImage(req.file.filename);

      return res.status(400).json({
        message: error.details[0].message
      });
    }

    // Use validated photo information
    const { title, description = "" } = value;

    // Save photo information in MongoDB
    const photo = await Photo.create({
      userId: req.session.userId,
      fileName: req.file.filename,
      title,
      description
    });

    // Return the created photo
    res.status(201).json({
      message: "Photo uploaded successfully",
      photo
    });
  } catch (error) {
    // Remove the uploaded file if database saving fails
    if (req.file) {
      await removeImage(req.file.filename);
    }

    res.status(500).json({
      message: "Photo upload failed"
    });
  }
};

// Delete a photo
const deletePhoto = async (req, res) => {
  try {
    // Validate the photo ID
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid photo ID"
      });
    }

    // Find the photo
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        message: "Photo not found"
      });
    }

    // Only the photo owner can delete it
    if (photo.userId.toString() !== req.session.userId) {
      return res.status(403).json({
        message: "You can only delete your own photos"
      });
    }

    // Delete the photo record from MongoDB
    await photo.deleteOne();

    // Delete the image from the uploads folder
    await removeImage(photo.fileName);

    res.status(200).json({
      message: "Photo deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete photo"
    });
  }
};

// Export the photo controller functions
module.exports = {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  deletePhoto
};
