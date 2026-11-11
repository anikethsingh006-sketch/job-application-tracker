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
const createRateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

const loginRateLimiter = createRateLimiter({
  windowSeconds: 15 * 60, // 15 minutes
  maxRequests: 5,
  keyPrefix: "login",
});

const registerRateLimiter = createRateLimiter({
  windowSeconds: 60 * 60, // 1 hour
  maxRequests: 5,
  keyPrefix: "register",
});

router.post(
  "/register",
  registerRateLimiter,
  registerValidator,
  validateRequest,
  register,
);

router.post("/login", loginRateLimiter, loginValidator, validateRequest, login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

module.exports = router;
