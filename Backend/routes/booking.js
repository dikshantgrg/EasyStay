const express = require("express");
const {
  makeBooking,
  getUserBooking,
  getSingleBooking,
  getGuestsForHost,
  getUserCompletedBooking,
  checkBookingAvailability,
  getAllBookings,
  monthlyBookingReport,
  getEarnings,
  getBookingCount,

  deleteBooking,
  cancelBooking,
} = require("../controller/booking");
const { checkAuthorization, isHost, isAdmin } = require("../middleware/auth");
const router = express.Router();

// for user
router.get(
  "/api/check-availability",
  checkAuthorization,
  checkBookingAvailability
);
router.post("/api/make-booking", checkAuthorization, makeBooking);
router.get("/api/user-booking", checkAuthorization, getUserBooking);
router.get("/api/booking/:bookingId", checkAuthorization, getSingleBooking);
router.get(
  "/api/completed-booking",
  checkAuthorization,
  getUserCompletedBooking
);
router.put("/api/cancel-booking/:bookingId", checkAuthorization, cancelBooking);


//for host
router.get(
  "/api/host-booking/:category",
  checkAuthorization,
  isHost,
  getGuestsForHost
);

// for admin
router.get("/api/admin/bookings", checkAuthorization, isAdmin, getAllBookings);
router.get(
  "/api/admin/monthly-bookings-report",
  checkAuthorization,
  isAdmin,
  monthlyBookingReport
);
router.delete(
  "/api/admin/delete-booking/:id",
  checkAuthorization,
  isAdmin,
  deleteBooking
);

// router.get("/api/admin/guest-stats", checkAuthorization, getGuestStats);
router.get("/api/admin/earnings", checkAuthorization, isAdmin, getEarnings);
router.get(
  "/api/admin/booking-count",
  checkAuthorization,
  isAdmin,
  getBookingCount
);

module.exports = router;
