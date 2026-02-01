const mongoose = require("mongoose");

const recurringSchema = new mongoose.Schema({
  member: String,
  title: String,
  amount: Number,
  dayOfMonth: Number,
  lastReceived: Date
}, { timestamps: true });

module.exports = mongoose.model("RecurringIncome", recurringSchema);
