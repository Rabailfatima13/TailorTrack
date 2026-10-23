const express = require("express");
const { getStaff, createStaff, updateStaff, getWorkSummary } = require("../controllers/userController");
const { protect, ownerOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, ownerOnly);

router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.get("/staff/summary", getWorkSummary);
router.put("/staff/:id", updateStaff);

module.exports = router;
