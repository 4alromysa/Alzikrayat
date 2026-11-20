// Import required modules
const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Import photo controller functions
const {
  getAllPhotos,
  getPhotoById,
  uploadPhoto,
  deletePhoto
} = require("../controllers/photoController");

// Create the photo router
const router = express.Router();

// Allow only logged-in users to change photos
const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  next();
};

// Allowed image formats
const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

// Configure where uploaded images are stored
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),

  // Generate a unique file name
  filename: (req, file, cb) => {
    const extension = allowedTypes[file.mimetype];
    const fileName = crypto.randomUUID() + extension;

    cb(null, fileName);
  }
});

// Configure image upload rules
const upload = multer({
  storage,

  // Limit uploads to 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024
  },

  // Accept only supported image MIME types
  fileFilter: (req, file, cb) => {
    if (!allowedTypes[file.mimetype]) {
      return cb(new Error("Unsupported image type"));
    }

    cb(null, true);
  }
});

// Handle upload errors
const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    next();
  });
};

// Public route: get all photos
router.get("/", getAllPhotos);

// Public route: get one photo
router.get("/:id", getPhotoById);

// Protected route: upload a photo
router.post(
  "/",
  requireLogin,
  uploadImage,
  uploadPhoto
);

// Protected route: delete an owned photo
router.delete(
  "/:id",
  requireLogin,
  deletePhoto
);

// Export photo routes
module.exports = router;