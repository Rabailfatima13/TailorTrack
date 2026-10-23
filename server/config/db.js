const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
