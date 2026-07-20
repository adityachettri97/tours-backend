const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/reviews - public
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// POST /api/reviews - admin only
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, location, quote } = req.body;
    const newReview = new Review({ name, location, quote });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ message: "Error creating review" });
  }
});

// PUT /api/reviews/:id - admin only
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, location, quote } = req.body;
    const updated = await Review.findByIdAndUpdate(req.params.id, { name, location, quote }, { new: true });
    if (!updated) return res.status(404).json({ message: "Review not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update review error:", err);
    res.status(500).json({ message: "Error updating review" });
  }
});

// DELETE /api/reviews/:id - admin only
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting review" });
  }
});

module.exports = router;
