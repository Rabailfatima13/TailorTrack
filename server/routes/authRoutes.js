const express = require("express");
const { login, logout, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const loginLimiter = require("../middleware/loginLimiter");

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
