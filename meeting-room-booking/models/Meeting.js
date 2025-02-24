const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  room: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  bookedBy: { type: String, required: true },
});

module.exports = mongoose.model("Meeting", meetingSchema);
