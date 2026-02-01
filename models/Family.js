const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  familyName: String,
  familyPinHash: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Family", familySchema);
