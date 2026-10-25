const express = require("express");

const validateObjectId = require("../middleware/validateObjectId");
const validateRequest = require("../middleware/validateRequest");

const {
  createApplicationValidator,
  updateApplicationValidator,
} = require("../validators/applicationValidator");

const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

const router = express.Router();

// Create an application with validation
router.post(
  "/",
  createApplicationValidator,
  validateRequest,
  createApplication,
);

// Read applications
router.get("/", getApplications);
router.get("/:id", validateObjectId, getApplicationById);

// Update an application
router.put(
  "/:id",
  validateObjectId,
  updateApplicationValidator,
  validateRequest,
  updateApplication,
);

// Delete an application
router.delete("/:id", validateObjectId, deleteApplication);

module.exports = router;
