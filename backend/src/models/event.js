const mongoose = require("mongoose");

const eventLogSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  type: { type: String, required: true },
  durationMs: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EventLog", eventLogSchema);
