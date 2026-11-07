const { body } = require("express-validator");

const interviewValidator = [
  body("round").trim().notEmpty().withMessage("Interview round is required"),

  body("type")
    .optional()
    .isIn(["Phone", "Video", "Onsite", "Other"])
    .withMessage("Invalid interview type"),

  body("scheduledAt")
    .notEmpty()
    .withMessage("Interview date is required")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("Invalid interview date"),

  body("durationMinutes")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),

  body("meetingLink")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Invalid meeting link"),

  body("outcome")
    .optional()
    .isIn(["Pending", "Passed", "Failed", "Cancelled"])
    .withMessage("Invalid interview outcome"),
];

module.exports = interviewValidator;
