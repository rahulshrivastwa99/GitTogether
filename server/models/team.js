const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  hackathonName: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Team", teamSchema);
