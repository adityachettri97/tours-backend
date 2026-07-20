const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Package", packageSchema);
