const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder where images are stored
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); //10mb

// Example Tour model (adjust if you're using MongoDB or Mongoose)
const Tour = require("../models/Tour");

// POST /api/tours
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const newTour = new Tour({
      title,
      description,
      imageUrls: imagePaths,
    });

    await newTour.save();

    res.status(201).json({ message: "Tour created successfully", tour: newTour });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating tour" });
  }
});

/**
 * GET all tours
 * GET /api/tours
 */
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tours" });
  }
});

/**
 * DELETE a tour
 * DELETE /api/tours/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    res.json({ message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting tour" });
  }
});

/**
 * UPDATE a tour
 * PUT /api/tours/:id
 */
// routes/tours.js
router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    const existingImages = JSON.parse(req.body.existingImages || "[]");

    // Get newly uploaded image filenames
    const newImageUrls = req.files.map((file) => "/uploads/" + file.filename);

    // Merge old + new
    const allImages = [...existingImages, ...newImageUrls];

    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, { title, description, imageUrls: allImages }, { new: true });

    res.json(updatedTour);
  } catch (err) {
    console.error("Error updating tour:", err);
    res.status(500).json({ error: "Failed to update tour" });
  }
});

module.exports = router;
