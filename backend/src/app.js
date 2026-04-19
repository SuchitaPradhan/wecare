const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// Schema
const RecordSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    notes: String,
  },
  { timestamps: true }
);

// Model
const Record = mongoose.model("Record", RecordSchema);

// Routes
app.post("/records", async (req, res) => {
  try {
    const { name, age, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const record = new Record({ name, age, notes });
    await record.save();

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});