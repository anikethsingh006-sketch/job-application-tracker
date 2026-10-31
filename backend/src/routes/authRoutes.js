const express = require("express");
const { register } = require("../controllers/authController");
const { registerValidator } = require("../validators/authValidator");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, register);

module.exports = router;
