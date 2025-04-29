const express = require("express");
const router = express.Router();


const { checkAuthorization, isHost, isAdmin } = require("../middleware/auth");
const { getDashboardStats, getRecentBookings, getHostDashboardStats } = require("../controller/dashboardController");

// Admin dashboard routes
router.get("/api/admin/dashboard-stats", checkAuthorization, isAdmin, getDashboardStats);
router.get("/api/admin/recent-bookings", checkAuthorization, isAdmin ,getRecentBookings);


//host dashboard routes
router.get("/api/host/dashboard-stats", checkAuthorization,isHost, getHostDashboardStats);

module.exports = router;