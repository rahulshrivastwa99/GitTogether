const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  date: String,
  note: String,
});

module.exports = mongoose.model("Calendar", calendarSchema);
