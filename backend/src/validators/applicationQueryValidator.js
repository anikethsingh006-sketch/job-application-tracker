const { query } = require("express-validator");

const applicationQueryValidator = [
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .trim(),

  query("status")
    .optional()
    .isIn([
      "Saved",
      "Applied",
      "Online Assessment",
      "Interview",
      "Offer",
      "Rejected",
      "Withdrawn",
    ])
    .withMessage("Invalid application status"),

  query("sort")
    .optional()
    .isIn(["newest", "oldest"])
    .withMessage("Sort must be newest or oldest"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

module.exports = applicationQueryValidator;
