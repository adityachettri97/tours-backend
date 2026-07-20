const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_SIGNUP_CODE = process.env.ADMIN_SIGNUP_CODE;

// Register route - every account created here is an admin.
// Requires the shared ADMIN_SIGNUP_CODE so only people you've given the code to can register.
router.post("/register", async (req, res) => {
  const { username, email, password, adminCode } = req.body;

  if (!adminCode || adminCode !== ADMIN_SIGNUP_CODE) {
    return res.status(403).json({ message: "Invalid admin code" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Login route

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "2h" });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot password - step 1: send OTP to email
router.post("/forgot-password/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Forgot password - step 2: verify OTP, get a short-lived reset token
router.post("/forgot-password/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    if (user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    const resetToken = jwt.sign({ id: user._id, purpose: "password-reset" }, JWT_SECRET, { expiresIn: "10m" });

    res.json({ resetToken });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot password - step 3: reset password using the verified reset token
router.post("/forgot-password/reset-password", async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: "Reset token and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    if (decoded.purpose !== "password-reset") {
      return res.status(401).json({ message: "Invalid reset token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired reset token" });
  }
});

module.exports = router;
