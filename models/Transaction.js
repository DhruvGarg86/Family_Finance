const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  familyId: mongoose.Schema.Types.ObjectId,

  amount: Number,
  type: String,
  category: String,

  source: String,
  target: String,

  paymentMode: String,
  bankName: String,

  date: String,
  time: String,
  comment: String,

  addedBy: String,
  forMember: String,

  status: { type: String, default: "Pending" },
  approvalRequiredFrom: String,
  approvedBy: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
