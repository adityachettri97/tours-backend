const multer = require("multer");

// Store files in memory (no disk) so we can save to MongoDB as Base64
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per image
});

const toBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

module.exports = { upload, toBase64 };
