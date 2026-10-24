const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

const router = express.Router();

router.post("/", createApplication);
router.get("/", getApplications);
router.get("/:id", validateObjectId, getApplicationById);
router.put("/:id", validateObjectId, updateApplication);
router.delete("/:id", validateObjectId, deleteApplication);
module.exports = router;
