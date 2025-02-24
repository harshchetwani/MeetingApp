const express = require("express");
const {
  getAvailableSlots,
  scheduleMeeting,
  rescheduleMeeting,
  cancelMeeting,
} = require("../controllers/meetingController");

const router = express.Router();

router.get("/available-slots", getAvailableSlots);
router.post("/schedule", scheduleMeeting);
router.put("/reschedule", rescheduleMeeting);
router.delete("/cancel/:id", cancelMeeting);

module.exports = router;
