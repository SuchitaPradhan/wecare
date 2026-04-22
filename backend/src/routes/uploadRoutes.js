const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const Document = require("../models/Document");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const category = req.body.category || "test";
    if (!["test", "prescription"].includes(category)) {
      return res.status(400).json({ message: "Invalid upload category" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const title =
      req.body.title ||
      req.file.originalname.replace(path.extname(req.file.originalname), "");

    const document = await Document.create({
      user: req.user.id,
      category,
      title,
      originalName: req.file.originalname,
      fileUrl,
    });

    res.json({ message: "File uploaded successfully", fileUrl, document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
