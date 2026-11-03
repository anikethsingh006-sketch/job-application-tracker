const express = require("express");

const validateObjectId = require("../middleware/validateObjectId");
const validateRequest = require("../middleware/validateRequest");
const requireAuth = require("../middleware/requireAuth");
const validateInterviewId = require("../middleware/validateInterviewId");

const {
  createApplicationValidator,
  updateApplicationValidator,
} = require("../validators/applicationValidator");
const interviewValidator = require("../validators/interviewValidator");
const updateInterviewValidator = require("../validators/updateInterviewValidator");

const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  createInterview,
  updateInterview,
  deleteInterview,
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

router.post(
  "/:id/interviews",
  requireAuth,
  validateObjectId,
  interviewValidator,
  validateRequest,
  createInterview,
);

router.put(
  "/:id/interviews/:interviewId",
  requireAuth,
  validateObjectId,
  validateInterviewId,
  updateInterviewValidator,
  validateRequest,
  updateInterview,
);

router.delete(
  "/:id/interviews/:interviewId",
  requireAuth,
  validateObjectId,
  validateInterviewId,
  deleteInterview,
);

module.exports = router;
