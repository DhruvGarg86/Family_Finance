const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  familyId: mongoose.Schema.Types.ObjectId,
  name: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Member", memberSchema);
