const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
