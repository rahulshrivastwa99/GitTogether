const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  date: String,
  note: String,
  // Added fields to store original hackathon data
  host: String,
  location: String,
  prize: String,
  description: String,
  link: String,
});

module.exports = mongoose.model("Calendar", calendarSchema);
