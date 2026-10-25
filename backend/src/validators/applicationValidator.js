const { body } = require("express-validator");

const createApplicationValidator = [
  body("company").trim().notEmpty().withMessage("Company name is required"),

  body("role").trim().notEmpty().withMessage("Job role is required"),

  body("status")
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
];
const updateApplicationValidator = [
  body("company")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company name cannot be empty"),

  body("role")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Job role cannot be empty"),

  body("status")
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
];
module.exports = { createApplicationValidator, updateApplicationValidator };
