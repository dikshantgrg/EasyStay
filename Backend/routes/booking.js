const express = require("express");
const {
  makeBooking,
  getUserBooking,
  getSingleBooking,
  getGuestsForHost,
  getUserCompletedBooking,
} = require("../controller/booking");
const { checkAuthorization } = require("../middleware/auth");
const router = express.Router();

// for user 
router.post("/api/make-booking", checkAuthorization, makeBooking);
router.get("/api/user-booking", checkAuthorization, getUserBooking);
router.get("/api/booking/:bookingId", checkAuthorization, getSingleBooking);
router.get("/api/completed-booking", checkAuthorization,  getUserCompletedBooking);




//for host 
router.get("/api/host-booking/:category", checkAuthorization, getGuestsForHost);


module.exports = router;
