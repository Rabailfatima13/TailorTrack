const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const ONE_DAY = 24 * 60 * 60 * 1000;

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ message: "Wrong username or password" });
  }

  if (!user.active) {
    return res.status(403).json({ message: "This account has been disabled" });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_DAY,
  });

  res.json({ user });
});

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, logout, me };
