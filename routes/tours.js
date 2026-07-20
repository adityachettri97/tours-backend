const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tour = require("../models/Tour");
const authMiddleware = require("../middleware/authMiddleware");

// Store files in memory (no disk) so we can save to MongoDB as Base64
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per image
});

// Convert uploaded file buffer to Base64 data URI
const toBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

// POST /api/tours
router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrls = req.files.map(toBase64);

    const newTour = new Tour({ title, description, imageUrls });
    await newTour.save();

    res.status(201).json({ message: "Tour created successfully", tour: newTour });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating tour" });
  }
});

// GET /api/tours
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tours" });
  }
});

// DELETE /api/tours/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json({ message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting tour" });
  }
});

// PUT /api/tours/:id
router.put("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description } = req.body;
    const existingImages = JSON.parse(req.body.existingImages || "[]");
    const newImageUrls = req.files.map(toBase64);
    const allImages = [...existingImages, ...newImageUrls];

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrls: allImages },
      { new: true }
    );

    res.json(updatedTour);
  } catch (err) {
    console.error("Error updating tour:", err);
    res.status(500).json({ error: "Failed to update tour" });
  }
});

module.exports = router;
