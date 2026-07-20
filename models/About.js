const mongoose = require("mongoose");

// Singleton: only one About document should ever exist.
const aboutSchema = new mongoose.Schema({
  title: { type: String, default: "About TravelPeak" },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
});

module.exports = mongoose.model("About", aboutSchema);
