const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const path = require("path");

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
const tourRoutes = require("./routes/tours");
const chatRoutes = require("./routes/chat");

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/chat", chatRoutes);

// MongoDB + Server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));
