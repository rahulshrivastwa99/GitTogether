const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teamName: { type: String, required: true },
  hackathonName: { type: String, required: true },
  members: [
    {
      name: String,
      role: String,
      hours: String,
      responsibility: String,
    },
  ],
  ipRule: { type: String, default: "opensource" },
  decisionRule: { type: String, default: "majority" },
  status: {
    type: String,
    enum: ["Draft", "Signed"],
    default: "Draft",
  },
  signed: { type: Boolean, default: false },
  signedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Agreement", agreementSchema);
