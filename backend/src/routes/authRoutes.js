const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const validateRequest = require("../middleware/validateRequest");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

module.exports = router;
