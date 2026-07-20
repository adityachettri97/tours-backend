const express = require("express");
const router = express.Router();
const Package = require("../models/Package");
const authMiddleware = require("../middleware/authMiddleware");
const { upload, toBase64 } = require("../utils/upload");

// GET /api/packages - public
router.get("/", async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching packages" });
  }
});

// POST /api/packages - admin only
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const imageUrl = req.file ? toBase64(req.file) : "";

    const newPackage = new Package({ title, description, price, imageUrl });
    await newPackage.save();

    res.status(201).json(newPackage);
  } catch (err) {
    console.error("Create package error:", err);
    res.status(500).json({ message: "Error creating package" });
  }
});

// PUT /api/packages/:id - admin only
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const update = { title, description, price };
    if (req.file) update.imageUrl = toBase64(req.file);

    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updatedPackage) return res.status(404).json({ message: "Package not found" });

    res.json(updatedPackage);
  } catch (err) {
    console.error("Update package error:", err);
    res.status(500).json({ message: "Error updating package" });
  }
});

// DELETE /api/packages/:id - admin only
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Package not found" });
    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting package" });
  }
});

module.exports = router;
