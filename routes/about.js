const express = require("express");
const router = express.Router();
const About = require("../models/About");
const authMiddleware = require("../middleware/authMiddleware");
const { upload, toBase64 } = require("../utils/upload");

// GET /api/about - public, returns the singleton About doc (creates a default one if none exists)
router.get("/", async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) about = await About.create({});
    res.json(about);
  } catch (err) {
    console.error("Get about error:", err);
    res.status(500).json({ message: "Error fetching about content" });
  }
});

// PUT /api/about - admin only, upserts the singleton About doc
router.put("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const update = { title, description };
    if (req.file) update.imageUrl = toBase64(req.file);

    const about = await About.findOneAndUpdate({}, update, { new: true, upsert: true });
    res.json(about);
  } catch (err) {
    console.error("Update about error:", err);
    res.status(500).json({ message: "Error updating about content" });
  }
});

module.exports = router;
