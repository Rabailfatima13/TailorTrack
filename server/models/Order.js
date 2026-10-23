const mongoose = require("mongoose");
const measurementSchema = require("./measurementSchema");

const STATUSES = ["Pending", "In progress", "Ready", "Delivered"];

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: [1, "Payment must be greater than 0"] },
  date: { type: Date, default: Date.now },
  note: { type: String, trim: true },
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "Please assign a staff member"] },
    garmentType: { type: String, required: [true, "Garment type is required"], trim: true },
    measurements: { type: measurementSchema, default: {} },
    instructions: { type: String, trim: true },
    price: { type: Number, required: [true, "Price is required"], min: [1, "Price must be greater than 0"] },
    advance: { type: Number, default: 0, min: [0, "Advance cannot be negative"] },
    payments: [paymentSchema],
    dueDate: { type: Date, required: [true, "Due date is required"] },
    status: { type: String, enum: STATUSES, default: "Pending" },
    workRate: { type: Number, default: 0, min: [0, "Work rate cannot be negative"] },
    photo: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
    },
    readyAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSchema.virtual("totalPaid").get(function () {
  const paid = (this.payments || []).reduce((sum, p) => sum + p.amount, 0);
  return (this.advance || 0) + paid;
});

orderSchema.virtual("balance").get(function () {
  return this.price - this.totalPaid;
});

orderSchema.virtual("isOverdue").get(function () {
  const unfinished = this.status === "Pending" || this.status === "In progress";
  return unfinished && this.dueDate < new Date();
});

orderSchema.pre("validate", function (next) {
  if (this.price && this.totalPaid > this.price) {
    this.invalidate("payments", "Total paid cannot be more than the price");
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
Order.STATUSES = STATUSES;

module.exports = Order;
