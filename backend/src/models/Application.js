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
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    interviews: [
      {
        round: {
          type: String,
          required: true,
          trim: true,
        },

        type: {
          type: String,
          enum: ["Phone", "Video", "Onsite", "Other"],
          default: "Video",
        },

        scheduledAt: {
          type: Date,
          required: true,
        },

        durationMinutes: {
          type: Number,
          default: 60,
        },

        meetingLink: {
          type: String,
          default: "",
        },

        location: {
          type: String,
          default: "",
        },

        notes: {
          type: String,
          default: "",
        },

        outcome: {
          type: String,
          enum: ["Pending", "Passed", "Failed", "Cancelled"],
          default: "Pending",
        },
      },
    ],
    statusEvents: [
      {
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
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Application", applicationSchema);
