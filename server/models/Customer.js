const mongoose = require("mongoose");
const measurementSchema = require("./measurementSchema");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Customer name is required"], trim: true },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+\- ]{7,15}$/, "Phone number is not valid"],
    },
    address: { type: String, trim: true },
    measurements: { type: measurementSchema, default: {} },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
