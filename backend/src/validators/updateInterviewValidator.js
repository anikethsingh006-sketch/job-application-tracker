const { body } = require("express-validator");

const updateInterviewValidator = [
  body("round")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Interview round cannot be empty"),

  body("type")
    .optional()
    .isIn(["Phone", "Video", "Onsite", "Other"])
    .withMessage("Invalid interview type"),

  body("scheduledAt")
    .optional()
    .isISO8601()
    .withMessage("Invalid interview date"),

  body("durationMinutes")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),

  body("meetingLink").optional().isURL().withMessage("Invalid meeting link"),

  body("outcome")
    .optional()
    .isIn(["Pending", "Passed", "Failed", "Cancelled"])
    .withMessage("Invalid interview outcome"),
];

module.exports = updateInterviewValidator;
