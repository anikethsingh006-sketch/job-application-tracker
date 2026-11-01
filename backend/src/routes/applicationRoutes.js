const express = require("express");

const validateObjectId = require("../middleware/validateObjectId");
const validateRequest = require("../middleware/validateRequest");
const requireAuth = require("../middleware/requireAuth");

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
  requireAuth,
  createApplicationValidator,
  validateRequest,
  createApplication,
);

// Read applications
router.get("/", requireAuth, getApplications);
router.get("/:id", requireAuth, validateObjectId, getApplicationById);

// Update an application
router.put(
  "/:id",
  requireAuth,
  validateObjectId,
  updateApplicationValidator,
  validateRequest,
  updateApplication,
);

// Delete an application
router.delete("/:id", requireAuth, validateObjectId, deleteApplication);

module.exports = router;
