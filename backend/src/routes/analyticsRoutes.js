const express = require("express");

const {
  getAnalyticsController,
} = require("../controllers/analyticsController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", requireAuth, getAnalyticsController);

module.exports = router;
