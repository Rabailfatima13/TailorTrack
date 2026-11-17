const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Quick check that the API is up and can reach MongoDB (useful for deployment and debugging).
router.get("/", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "degraded",
    database: connected ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
  });
});

module.exports = router;
