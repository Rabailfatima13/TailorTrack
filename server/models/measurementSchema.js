const mongoose = require("mongoose");

const size = { type: Number, min: [0, "Measurements cannot be negative"] };

const measurementSchema = new mongoose.Schema(
  {
    chest: size,
    waist: size,
    hips: size,
    shoulder: size,
    sleeve: size,
    neck: size,
    length: size,
    trouserLength: size,
    notes: { type: String, trim: true },
  },
  { _id: false }
);

module.exports = measurementSchema;
