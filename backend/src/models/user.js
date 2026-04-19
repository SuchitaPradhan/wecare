const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    // ── Doctor-specific fields ──────────────────────────────
    specialty: { type: String, default: "" },
    qualification: { type: String, default: "" },
    experience: { type: Number, default: 0 },
    hospital: { type: String, default: "" },
    city: { type: String, default: "" },
    shifts: { type: String, default: "" },
    languages: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },

    // ── Patient-specific fields ─────────────────────────────
    dob: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    bloodGroup: { type: String, default: "" },
    address: { type: String, default: "" },
    allergies: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);