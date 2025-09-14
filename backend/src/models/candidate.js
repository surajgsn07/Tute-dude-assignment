const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  interviewId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  integrityScore: { type: Number, default: 100 },
  interviewUrl: { type: String },
});

module.exports = mongoose.model("Candidate", candidateSchema);
