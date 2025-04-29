const Booking = require("../model/Booking");
const User = require("../model/User");
const Property = require("../model/Property");
const moment = require("moment");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalHosts = await User.countDocuments({ role: "host" });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const activeBookings = await Booking.countDocuments({ status: "active" });
    const upcomingBookings = await Booking.countDocuments({
      status: "upcoming",
    });

    // Calculate total earnings from completed bookings
    const earningsResult = await Booking.aggregate([
      {
        $match: { status: "completed", totalPrice: { $gte: 0 } },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalEarnings =
      earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalHosts,
        completedBookings,
        activeBookings,
        upcomingBookings,
        totalEarnings,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard statistics",
    });
  }
};

const getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "userId",
        select: "FirstName LastName",
      })
      .populate({
        path: "propertyId",
        select: "title",
        populate: {
          path: "addressId",
          select: "city country",
        },
      });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.bookingId,
      user: `${booking.userId.FirstName} ${booking.userId.LastName}`,
      property: booking.propertyId.title,
      location: `${booking.propertyId.addressId.city}, ${booking.propertyId.addressId.country}`,
      date: moment(booking.createdAt).format("YYYY-MM-DD"),
      status: booking.status,
    }));

    res.status(200).json({
      success: true,
      data: formattedBookings,
    });
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent bookings",
    });
  }
};

const mongoose = require("mongoose");

const getHostDashboardStats = async (req, res) => {
  try {
    const hostId = req.user._id; // Assuming user ID is available in req.user from authentication middleware

    // Convert hostId to ObjectId for aggregation
    const hostObjectId = new mongoose.Types.ObjectId(hostId);

    // Log hostId for debugging
    console.log("Host ID:", hostId);

    // Get counts for host-specific data
    const totalProperties = await Property.countDocuments({ hostId: hostId });
    const totalBookings = await Booking.countDocuments({ hostId: hostId });
    const completedBookings = await Booking.countDocuments({
      hostId: hostId,
      status: "completed",
    });

    // Calculate total earnings from completed bookings
    const earningsData = await Booking.aggregate([
      {
        $match: {
          hostId: hostObjectId, // Use ObjectId for aggregation
          status: "completed",
          totalPrice: { $gte: 0 }, // Simplified, as schema ensures totalPrice exists and is non-null
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalEarnings =
      earningsData.length > 0 ? earningsData[0].totalEarnings : 0;

    // Log for debugging

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        totalBookings,
        completedBookings,
        totalEarnings,
      },
    });
  } catch (error) {
    console.error("Error fetching host dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch host dashboard statistics",
    });
  }
};
module.exports = {
  getDashboardStats,
  getRecentBookings,
  getHostDashboardStats,
};
