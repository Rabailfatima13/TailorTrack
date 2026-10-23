require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Customer = require("./models/Customer");
const Order = require("./models/Order");

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Order.deleteMany();
  await Customer.deleteMany();
  await User.deleteMany();

  const owner = await User.create({ name: "Asif Tailor", username: "owner", password: "owner123", role: "owner" });
  const ali = await User.create({ name: "Ali Raza", username: "ali", password: "staff123", role: "staff" });
  const sara = await User.create({ name: "Sara Khan", username: "sara", password: "staff123", role: "staff" });

  const customers = await Customer.insertMany([
    {
      name: "Hamza Ahmed",
      phone: "0300-1234567",
      address: "Model Town, Lahore",
      measurements: { chest: 40, waist: 34, shoulder: 18, sleeve: 24, neck: 15, length: 42, trouserLength: 39 },
    },
    {
      name: "Ayesha Malik",
      phone: "0321-7654321",
      address: "Gulberg, Lahore",
      measurements: { chest: 34, waist: 28, hips: 38, shoulder: 14, sleeve: 21, length: 44 },
    },
    {
      name: "Bilal Hussain",
      phone: "0333-1112233",
      measurements: { chest: 42, waist: 36, shoulder: 19, sleeve: 25, neck: 16, length: 43 },
    },
  ]);

  const [hamza, ayesha, bilal] = customers;

  await Order.create([
    {
      customer: hamza._id,
      assignedTo: ali._id,
      garmentType: "Shalwar Kameez",
      measurements: hamza.measurements,
      instructions: "Collar with two side pockets",
      price: 3500,
      advance: 1000,
      dueDate: daysFromNow(5),
      workRate: 800,
    },
    {
      customer: ayesha._id,
      assignedTo: sara._id,
      garmentType: "Bridal Lehenga",
      measurements: ayesha.measurements,
      instructions: "Heavy embroidery on the border",
      price: 25000,
      advance: 10000,
      payments: [{ amount: 5000, note: "Second installment" }],
      dueDate: daysFromNow(12),
      status: "In progress",
      workRate: 5000,
    },
    {
      customer: bilal._id,
      assignedTo: ali._id,
      garmentType: "Waistcoat",
      measurements: bilal.measurements,
      price: 4000,
      advance: 2000,
      dueDate: daysFromNow(-2),
      status: "In progress",
      workRate: 1000,
    },
    {
      customer: hamza._id,
      assignedTo: sara._id,
      garmentType: "Kurta",
      measurements: hamza.measurements,
      price: 2000,
      advance: 2000,
      dueDate: daysFromNow(1),
      status: "Ready",
      readyAt: new Date(),
      workRate: 500,
    },
  ]);

  console.log("Sample data added");
  console.log("Owner login: owner / owner123");
  console.log("Staff logins: ali / staff123, sara / staff123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.log(err);
  process.exit(1);
});
