const User = require("../models/User");
const Order = require("../models/Order");
const catchAsync = require("../utils/catchAsync");

const getStaff = catchAsync(async (req, res) => {
  const staff = await User.find({ role: "staff" }).sort({ name: 1 });
  res.json(staff);
});

const createStaff = catchAsync(async (req, res) => {
  const { name, username, password, phone } = req.body;
  const user = await User.create({ name, username, password, phone, role: "staff" });
  res.status(201).json(user);
});

const updateStaff = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "staff") {
    return res.status(404).json({ message: "Staff member not found" });
  }

  const { name, phone, active, password } = req.body;

  // A deactivated account cannot log in, so unfinished work assigned to it would be stuck
  if (active === false && user.active) {
    const openOrders = await Order.countDocuments({
      assignedTo: user._id,
      status: { $in: ["Pending", "In progress"] },
    });
    if (openOrders > 0) {
      return res.status(400).json({
        message: `${user.name} still has ${openOrders} unfinished order(s). Reassign them before deactivating.`,
      });
    }
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (active !== undefined) user.active = active;
  if (password) user.password = password;

  await user.save();
  res.json(user);
});

const getWorkSummary = catchAsync(async (req, res) => {
  const staff = await User.find({ role: "staff" }).sort({ name: 1 });
  const completed = await Order.find({ status: { $in: ["Ready", "Delivered"] } });

  const summary = staff.map((person) => {
    const theirOrders = completed.filter((o) => o.assignedTo.toString() === person._id.toString());
    const earned = theirOrders.reduce((sum, o) => sum + (o.workRate || 0), 0);

    return {
      staffId: person._id,
      name: person.name,
      active: person.active,
      completedOrders: theirOrders.length,
      earned,
    };
  });

  res.json(summary);
});

module.exports = { getStaff, createStaff, updateStaff, getWorkSummary };
