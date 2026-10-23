const Order = require("../models/Order");
const catchAsync = require("../utils/catchAsync");

const getDashboard = catchAsync(async (req, res) => {
  const base = {};
  if (req.user.role === "staff") base.assignedTo = req.user._id;

  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const activeOrders = await Order.countDocuments({ ...base, status: { $ne: "Delivered" } });
  const readyOrders = await Order.countDocuments({ ...base, status: "Ready" });
  const overdueOrders = await Order.countDocuments({
    ...base,
    status: { $in: ["Pending", "In progress"] },
    dueDate: { $lt: now },
  });

  const upcoming = await Order.find({
    ...base,
    status: { $ne: "Delivered" },
    dueDate: { $gte: now, $lte: nextWeek },
  })
    .populate("customer", "name phone")
    .populate("assignedTo", "name")
    .sort({ dueDate: 1 })
    .limit(10);

  res.json({ activeOrders, readyOrders, overdueOrders, upcoming });
});

module.exports = { getDashboard };
