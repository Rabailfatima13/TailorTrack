const Order = require("../models/Order");
const Customer = require("../models/Customer");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const nextStatus = {
  Pending: ["In progress"],
  "In progress": ["Pending", "Ready"],
  Ready: ["In progress", "Delivered"],
  Delivered: [],
};

function canSeeOrder(user, order) {
  if (user.role === "owner") return true;
  const staffId = order.assignedTo._id || order.assignedTo;
  return staffId.toString() === user._id.toString();
}

async function findStaff(id) {
  if (!id) return null;
  const staff = await User.findById(id);
  if (!staff || staff.role !== "staff" || !staff.active) return null;
  return staff;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

const getOrders = catchAsync(async (req, res) => {
  const { status, staff, from, to, overdue, customer } = req.query;
  const filter = {};

  if (req.user.role === "staff") {
    filter.assignedTo = req.user._id;
  } else if (staff) {
    filter.assignedTo = staff;
  }

  if (status) filter.status = status;
  if (customer) filter.customer = customer;

  if (from || to) {
    filter.dueDate = {};
    if (from) filter.dueDate.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.dueDate.$lte = end;
    }
  }

  if (overdue === "true") {
    filter.status = { $in: ["Pending", "In progress"] };
    filter.dueDate = { ...filter.dueDate, $lt: new Date() };
  }

  const orders = await Order.find(filter)
    .populate("customer", "name phone")
    .populate("assignedTo", "name")
    .sort({ dueDate: 1 });

  res.json(orders);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("customer", "name phone address")
    .populate("assignedTo", "name username");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!canSeeOrder(req.user, order)) {
    return res.status(403).json({ message: "This order is not assigned to you" });
  }

  res.json(order);
});

const createOrder = catchAsync(async (req, res) => {
  const { customerId, assignedTo, garmentType, measurements, instructions, price, advance, dueDate, workRate } =
    req.body;

  const customer = await Customer.findById(customerId);
  if (!customer || customer.archived) {
    return res.status(400).json({ message: "Please choose a valid customer" });
  }

  const staff = await findStaff(assignedTo);
  if (!staff) {
    return res.status(400).json({ message: "Please assign the order to an active staff member" });
  }

  if (dueDate && new Date(dueDate) < startOfToday()) {
    return res.status(400).json({ message: "Due date cannot be in the past" });
  }

  const order = await Order.create({
    customer: customer._id,
    assignedTo: staff._id,
    garmentType,
    measurements: measurements || customer.measurements.toObject(),
    instructions,
    price,
    advance,
    dueDate,
    workRate,
  });

  res.status(201).json(order);
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const fields = ["garmentType", "measurements", "instructions", "price", "advance", "dueDate", "workRate"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) order[field] = req.body[field];
  });

  if (req.body.assignedTo && req.body.assignedTo !== order.assignedTo.toString()) {
    const staff = await findStaff(req.body.assignedTo);
    if (!staff) {
      return res.status(400).json({ message: "Please assign the order to an active staff member" });
    }
    order.assignedTo = staff._id;
  }

  await order.save();
  res.json(order);
});

const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (!canSeeOrder(req.user, order)) {
    return res.status(403).json({ message: "This order is not assigned to you" });
  }
  if (!Order.STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  if (status === "Delivered" && req.user.role !== "owner") {
    return res.status(403).json({ message: "Only the owner can mark an order as delivered" });
  }
  if (!nextStatus[order.status].includes(status)) {
    return res.status(400).json({ message: `Cannot change status from ${order.status} to ${status}` });
  }

  order.status = status;
  if (status === "Ready") order.readyAt = new Date();
  if (status === "Delivered") order.deliveredAt = new Date();
  if (status === "Pending" || status === "In progress") order.readyAt = undefined;

  await order.save();
  res.json(order);
});

const addPayment = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Enter a payment amount greater than 0" });
  }
  if (amount > order.balance) {
    return res.status(400).json({ message: `Payment is more than the remaining balance (${order.balance})` });
  }

  order.payments.push({ amount, note: req.body.note });
  await order.save();
  res.status(201).json(order);
});

const deleteOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await order.deleteOne();
  res.json({ message: "Order deleted" });
});

module.exports = { getOrders, getOrder, createOrder, updateOrder, updateStatus, addPayment, deleteOrder };
