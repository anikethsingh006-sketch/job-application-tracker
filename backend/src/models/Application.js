const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    jobUrl: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Saved",
        "Applied",
        "Online Assessment",
        "Interview",
        "Offer",
        "Rejected",
        "Withdrawn",
      ],
      default: "Saved",
    },

    appliedDate: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Application", applicationSchema);
