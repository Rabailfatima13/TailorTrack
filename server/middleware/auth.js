const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Please log in first" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.active) {
      return res.status(401).json({ message: "Account not found or disabled" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
}

function ownerOnly(req, res, next) {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Only the owner can do this" });
  }
  next();
}

module.exports = { protect, ownerOnly };
