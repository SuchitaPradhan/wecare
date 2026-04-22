const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    patientName: { type: String, required: true },
    patientEmail: { type: String, default: "" },
    doctorName: { type: String, default: "Any Available Doctor" },

    specialty: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    status: {
      type: String,
      enum: ["Upcoming", "Confirmed", "Completed", "Cancelled", "Pending"],
      default: "Upcoming",
    },

    notes: {
      type: String,
      default: "",
    },

    hospital: {
      type: String,
      default: "",
    },

    fee: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    paymentReference: {
      type: String,
      default: "",
    },

    remark: {
      type: String,
      default: "",
    },

    reportFile: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
