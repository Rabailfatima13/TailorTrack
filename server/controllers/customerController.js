const Customer = require("../models/Customer");
const Order = require("../models/Order");
const catchAsync = require("../utils/catchAsync");

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const getCustomers = catchAsync(async (req, res) => {
  const { search, archived } = req.query;
  const filter = { archived: archived === "true" };

  if (search) {
    const pattern = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: pattern }, { phone: pattern }];
  }

  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  res.json(customers);
});

const getCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const orders = await Order.find({ customer: customer._id })
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 });

  res.json({ customer, orders });
});

const createCustomer = catchAsync(async (req, res) => {
  const { name, phone, address, measurements } = req.body;
  const customer = await Customer.create({ name, phone, address, measurements });
  res.status(201).json(customer);
});

const updateCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const { name, phone, address, measurements, archived } = req.body;
  if (name !== undefined) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (address !== undefined) customer.address = address;
  if (measurements !== undefined) customer.measurements = measurements;
  if (archived !== undefined) customer.archived = archived;

  await customer.save();
  res.json(customer);
});

const deleteCustomer = catchAsync(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const orderCount = await Order.countDocuments({ customer: customer._id });

  if (orderCount > 0) {
    customer.archived = true;
    await customer.save();
    return res.json({ message: "Customer has orders, so they were archived instead", customer });
  }

  await customer.deleteOne();
  res.json({ message: "Customer deleted" });
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
