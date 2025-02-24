const Meeting = require("../models/Meeting");

// Get available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    const bookedMeetings = await Meeting.find({ date });
    
    const availableSlots = generateAvailableSlots(bookedMeetings);

    res.status(200).json({ availableSlots });
  } catch (error) {
    res.status(500).json({ error: "Error fetching available slots" });
  }
};

// Helper function to generate available slots
const generateAvailableSlots = (bookedMeetings) => {
  const allSlots = [
    { start: "09:00", end: "09:30" },
    { start: "10:00", end: "10:30" },
    { start: "11:00", end: "11:30" },
    { start: "13:00", end: "13:30" },
    { start: "14:00", end: "14:30" },
  ];

  return allSlots.filter((slot) => {
    return !bookedMeetings.some((meeting) =>
      (slot.start >= meeting.startTime && slot.start < meeting.endTime) ||
      (slot.end > meeting.startTime && slot.end <= meeting.endTime)
    );
  });
};

// Schedule a meeting
exports.scheduleMeeting = async (req, res) => {
    console.log("Schedule Meeting endpoint hit", req.body);
  try {
    const { room, date, startTime, endTime, bookedBy } = req.body;

    const conflict = await Meeting.findOne({
      room,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ error: "Slot already booked" });
    }

    const newMeeting = new Meeting({ room, date, startTime, endTime, bookedBy });
    await newMeeting.save();

    res.status(201).json({ message: "Meeting booked successfully", newMeeting });
  } catch (error) {
    res.status(500).json({ error: "Error scheduling meeting" });
  }
};

// Reschedule meeting
exports.rescheduleMeeting = async (req, res) => {
  try {
    const { id, newStartTime, newEndTime } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const conflict = await Meeting.findOne({
      room: meeting.room,
      date: meeting.date,
      _id: { $ne: id },
      $or: [
        { startTime: { $lt: newEndTime }, endTime: { $gt: newStartTime } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ error: "New slot conflicts with existing meeting" });
    }

    meeting.startTime = newStartTime;
    meeting.endTime = newEndTime;
    await meeting.save();

    res.status(200).json({ message: "Meeting rescheduled successfully", meeting });
  } catch (error) {
    res.status(500).json({ error: "Error rescheduling meeting" });
  }
};

// Cancel a meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    await Meeting.findByIdAndDelete(id);
    res.status(200).json({ message: "Meeting canceled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error canceling meeting" });
  }
};
