const express = require("express");
const router = express.Router();
const BlogPost = require("../models/BlogPost");
const authMiddleware = require("../middleware/authMiddleware");
const { upload, toBase64 } = require("../utils/upload");

// GET /api/blog - public
router.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog posts" });
  }
});

// GET /api/blog/:id - public
router.get("/:id", async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Blog post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog post" });
  }
});

// POST /api/blog - admin only
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl = req.file ? toBase64(req.file) : "";

    const newPost = new BlogPost({ title, description, imageUrl });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create blog post error:", err);
    res.status(500).json({ message: "Error creating blog post" });
  }
});

// PUT /api/blog/:id - admin only
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const update = { title, description };
    if (req.file) update.imageUrl = toBase64(req.file);

    const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updatedPost) return res.status(404).json({ message: "Blog post not found" });

    res.json(updatedPost);
  } catch (err) {
    console.error("Update blog post error:", err);
    res.status(500).json({ message: "Error updating blog post" });
  }
});

// DELETE /api/blog/:id - admin only
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog post not found" });
    res.json({ message: "Blog post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting blog post" });
  }
});

module.exports = router;
