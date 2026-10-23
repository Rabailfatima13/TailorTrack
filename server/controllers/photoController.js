const fs = require("fs");
const path = require("path");
const Order = require("../models/Order");
const { uploadDir } = require("../middleware/upload");
const catchAsync = require("../utils/catchAsync");

function removeFile(filename) {
  if (!filename) return;
  fs.unlink(path.join(uploadDir, filename), () => {});
}

const uploadPhoto = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please choose an image to upload" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    removeFile(req.file.filename);
    return res.status(404).json({ message: "Order not found" });
  }

  removeFile(order.photo && order.photo.filename);

  order.photo = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  };
  await order.save();

  res.json(order);
});

const getPhoto = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || !order.photo || !order.photo.filename) {
    return res.status(404).json({ message: "No photo for this order" });
  }

  const isOwner = req.user.role === "owner";
  const isAssigned = order.assignedTo.toString() === req.user._id.toString();
  if (!isOwner && !isAssigned) {
    return res.status(403).json({ message: "This order is not assigned to you" });
  }

  res.sendFile(path.join(uploadDir, order.photo.filename));
});

module.exports = { uploadPhoto, getPhoto, removeFile };
