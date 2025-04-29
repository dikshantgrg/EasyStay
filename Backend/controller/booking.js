const Booking = require("../model/Booking");
const User = require("../model/User");
const Property = require("../model/Property");
const moment = require("moment");
const Payment = require("../model/Payment");
const paymentController = require("./paymentController");
const jwt = require("jsonwebtoken");

const checkBookingAvailability = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { propertyId, checkIn, checkOut } = req.query;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Check if the user is the host of the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.hostId.toString() === userId.toString()) {
      return res.status(403).json({
        available: false,
        message: "You cannot book Your own properties",
      });
    }

    const checkInDate = moment(checkIn, "YYYY-MM-DD").toDate();
    const checkOutDate = moment(checkOut, "YYYY-MM-DD").toDate();

    const existingBooking = await Booking.findOne({
      propertyId,
      status: { $nin: ["completed"] },
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    if (existingBooking) {
      return res.json({
        available: false,
        message: "Property is already booked for these dates.",
      });
    }

    return res.json({
      available: true,
      message: "Property is available for booking.",
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const makeBooking = async (req, res, next) => {
  try {
    const {
      propertyId,
      userId,
      hostId,
      checkIn,
      checkOut,
      totalGuest,
      totalPrice,
      phoneNumber,
    } = req.body;

    if (
      !propertyId ||
      !userId ||
      !hostId ||
      !checkIn ||
      !checkOut ||
      !totalGuest ||
      !totalPrice
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res
        .status(400)
        .json({ error: "Check-out must be after check-in." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.phoneNumber) {
      if (!phoneNumber) {
        return res
          .status(400)
          .json({ error: "A valid phone number is required." });
      }
      user.phoneNumber = phoneNumber;
      await user.save({ validateBeforeSave: false });
    }

    let token = null;
    if (user.phoneNumber) {
      const payload = {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        UserId: user.UserId,
        profileImage: user.profileImage,
        role: user.role,
      };
      token = jwt.sign(payload, "shhhhh", { expiresIn: "1h" }); // Added expiration
    }
    // All caps unique booking ID
    const bookingId = `BK-${Date.now()
      .toString(36)
      .toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Determine initial status
    const newBooking = new Booking({
      bookingId,
      propertyId,
      userId,
      hostId,
      checkIn,
      checkOut,
      totalGuest,
      totalPrice,
      status: "pending",
    });

    await newBooking.save();

    const count = await Payment.countDocuments({});
    const paymentId = `PAY-${count + 1}`;

    const newPayment = new Payment({
      paymentId,
      bookingId,
      userId,
      amount: totalPrice * 100, // Convert to paisa for Khalti
      paymentStatus: "pending",
    });
    await newPayment.save();

  
    const paymentResponse = await paymentController.initiateKhaltiPayment({
      bookingId,
      totalPrice,
      user,
    });

    newPayment.paymentIdx = paymentResponse.pidx;
    await newPayment.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    newBooking.status =
      checkOutDate < today
        ? "completed"
        : checkInDate > today
        ? "upcoming"
        : "active";
    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully.",
      token,
      booking: newBooking,
      paymentUrl: paymentResponse.paymentUrl,
     
    });
  } catch (err) {
    console.log("Error making booking:", err);
    if (err.message.includes("Khalti Initiation Failed") && bookingId) {
      await Booking.deleteOne({ bookingId });
      await Payment.deleteOne({ bookingId });
      return res.status(400).json({
        error: "Failed to initiate payment. Booking canceled.",
        details: err.message,
      });
    }
    res.status(500).json({ error: "Server error.", details: err.message });
  }
};

const getUserBooking = async (req, res) => {
  const userid = req.user._id;
  const { page = 1, limit = 1, sortField = "status", status } = req.query;

  try {
    // Build query object
    const query = { userId: userid };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ [sortField]: 1 }) // Sort by status in ascending order
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate({
        path: "propertyId",
        populate: {
          path: "addressId",
        },
      })
      .populate("hostId");

    const totalBookings = await Booking.countDocuments(query);

    res.status(200).json({
      message: "User bookings fetched successfully.",
      bookings,
      pagination: {
        total: totalBookings,
        page: Number(page),
        pages: Math.ceil(totalBookings / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error.", details: error.message });
  }
};

const getSingleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId })
      .populate({
        path: "propertyId",
        populate: {
          path: "addressId",
        },
      })
      .populate("hostId")
      .populate("userId");

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ error: "Server error.", details: error.message });
  }
};

const getGuestsForHost = async (req, res) => {
  const { category } = req.params;
  const { search = "", page = 1, limit = 10, startDate, endDate } = req.query; // Added startDate, endDate
  console.log(category, { search, page, limit, startDate, endDate });

  try {
    const hostId = req.user._id;

    const currentDate = moment().toDate();
    const nextWeek = moment().add(7, "days").toDate();

    let filter = { hostId: hostId }; // Default filter for all bookings by host

    // Apply filters based on the category
    switch (category) {
      case "Checking Out":
        filter = {
          ...filter,
          checkOut: { $lte: currentDate },
          status: { $ne: "completed" },
        };
        break;

      case "Current Guest":
        filter = {
          ...filter,
          checkIn: { $lte: currentDate },
          checkOut: { $gte: currentDate },
          status: { $ne: "completed" },
        };
        break;

      case "Arriving Soon":
        filter = {
          ...filter,
          checkIn: { $gt: currentDate, $lte: nextWeek },
          status: { $ne: "completed" },
        };
        break;

      case "Upcoming":
        filter = {
          ...filter,
          checkIn: { $gt: nextWeek },
          status: { $ne: "completed" },
        };
        break;

      case "Completed":
        filter = {
          ...filter,
          status: "completed",
        };
        break;

      case "All":
        // No additional filters needed; keep only hostId
        break;

      default:
        return res.status(400).json({ message: "Invalid category" });
    }

    // Add search term filter if provided
    if (search) {
      filter.$or = [
        { "userId.FirstName": { $regex: search, $options: "i" } }, // Case-insensitive search on guest first name
        { "userId.LastName": { $regex: search, $options: "i" } }, // Case-insensitive search on guest last name
        { bookingId: { $regex: search, $options: "i" } }, // Case-insensitive search on bookingId
      ];
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      const start = moment(startDate).startOf("day").toDate();
      const end = moment(endDate).endOf("day").toDate();
      filter.$or = filter.$or || []; // Ensure $or exists for combining conditions
      filter.$or.push({
        $or: [
          { checkIn: { $gte: start, $lte: end } }, // Check-in within range
          { checkOut: { $gte: start, $lte: end } }, // Check-out within range
          { $and: [{ checkIn: { $lte: start } }, { checkOut: { $gte: end } }] }, // Booking spans the entire range
        ],
      });
    }

    // Convert page and limit to numbers and calculate skip
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Query the Booking model with pagination and populate the property details
    const reservations = await Booking.find(filter)
      .populate({
        path: "propertyId",
        populate: {
          path: "addressId",
        },
      })
      .populate({
        path: "userId",
        select: "FirstName LastName phoneNumber Email profileImage",
      })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination metadata
    const totalReservations = await Booking.countDocuments(filter);

    // Respond with the reservations and pagination metadata
    return res.status(200).json({
      message: "Reservations fetched successfully",
      data: reservations,
      pagination: {
        total: totalReservations,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalReservations / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching guest reservations:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserCompletedBooking = async (req, res) => {
  const userid = req.user._id;
  const { page = 1, limit = 6 } = req.query;
  const skip = (page - 1) * limit;

  try {
    // Get total count of completed bookings that haven't been reviewed
    const totalBookings = await Booking.countDocuments({
      userId: userid,
      status: "completed",
      hasReviewed: false,
    });

    // Get paginated bookings
    const bookings = await Booking.find({
      userId: userid,
      status: "completed",
      hasReviewed: false,
    })
      .populate({
        path: "propertyId",
        populate: {
          path: "addressId",
        },
      })
      .populate("hostId")
      .sort({ checkOut: -1 }) // Sort by checkout date, most recent first
      .skip(skip)
      .limit(Number(limit));

    if (bookings.length === 0 && page === 1) {
      return res.status(404).json({ error: "No completed bookings found." });
    }

    res.status(200).json({
      message: "User completed bookings fetched successfully.",
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error.", details: error.message });
  }
};

const updateBookingStatus = async () => {
  try {
    const currentDate = new Date();

    // Find bookings that are 'active' or 'upcoming' and need updating
    const bookings = await Booking.find({
      $or: [
        { status: "active", checkOut: { $lt: currentDate } },
        { status: "upcoming", checkIn: { $lte: currentDate } },
      ],
    });

    // Update statuses accordingly
    const updatePromises = bookings.map((booking) => {
      if (booking.status === "active" && booking.checkOut < currentDate) {
        booking.status = "completed";
      } else if (
        booking.status === "upcoming" &&
        booking.checkIn <= currentDate
      ) {
        booking.status = "active";
      }
      return booking.save(); // Save updated booking
    });

    await Promise.all(updatePromises);

    console.log(`Updated ${bookings.length} booking statuses.`);
    return { success: true, updatedCount: bookings.length };
  } catch (error) {
    console.error("Failed to update booking statuses:", error);
    throw error;
  }
};

const startStatusUpdateScheduler = () => {
  const intervalMs = 3600000; // 1 hour in milliseconds (adjust as needed)

  setInterval(async () => {
    console.log("Running scheduled booking status update...");
    try {
      await updateBookingStatus();
    } catch (error) {
      console.error("Scheduled update failed:", error);
    }
  }, intervalMs);

  // Run immediately on start (optional)
  updateBookingStatus().catch((error) => {
    console.error("Initial update failed:", error);
  });

  console.log(
    `Booking status scheduler started. Updates will run every ${
      intervalMs / 60000
    } minutes.`
  );
};

const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    // Handle status filter
    if (status) {
      filter.status = status;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (search && search.trim() !== "") {
      // Find matching Property and User ObjectIds
      const [matchingProperties, matchingUsers] = await Promise.all([
        Property.find(
          { propertyId: { $regex: new RegExp(search, "i") } },
          "_id"
        ).lean(),
        User.find(
          { UserId: { $regex: new RegExp(search, "i") } },
          "_id"
        ).lean(),
      ]);

      const propertyIds = matchingProperties.map((prop) => prop._id);
      const userIds = matchingUsers.map((user) => user._id);

      // Build $or condition for bookingId, propertyId, and userId
      filter.$or = [
        { bookingId: { $regex: new RegExp(search, "i") } },
        { propertyId: { $in: propertyIds } },
        { userId: { $in: userIds } },
      ];
    }

    // Set sort direction
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    const bookings = await Booking.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "userId",
        select: "FirstName LastName email phoneNumber UserId", // Include userId for output
      })
      .populate({
        path: "propertyId",
        select: "title addressId propertyId", // Include propertyId for output
        populate: {
          path: "addressId",
          select: "city street ",
        },
      })
      .sort(sortOptions);

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
      },
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message,
    });
  }
};

const monthlyBookingReport = async (req, res) => {
  try {
    // Validate year input
    const year = parseInt(req.query.year) || new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ error: "Invalid year provided" });
    }

    // Define date range (normalized to UTC to avoid timezone issues)
    const startDate = new Date(Date.UTC(year, 0, 1)); // Jan 1, 00:00:00 UTC
    const endDate = new Date(Date.UTC(year + 1, 0, 1)); // Jan 1 next year, 00:00:00 UTC

    // Fetch bookings
    const bookings = await Booking.find({
      checkIn: { $gte: startDate, $lt: endDate },
    }).select("checkIn");

    // Count bookings by month
    const monthlyCounts = Array(12).fill(0);
    bookings.forEach((booking) => {
      if (booking.checkIn instanceof Date && !isNaN(booking.checkIn)) {
        const month = booking.checkIn.getUTCMonth(); // Use UTC to avoid timezone discrepancies
        monthlyCounts[month] += 1;
      }
    });

    // Response
    const reportData = {
      year,
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      counts: monthlyCounts,
    };

    // Log for debugging
    console.log(`Bookings found: ${bookings.length}`);
    console.log(`Monthly counts: ${reportData}`);

    res.json(reportData);
  } catch (error) {
    console.error(`Error generating report: ${error.message}`);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

const getEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Set date range (default to current year)
    const currentYear = new Date().getFullYear();
    const start = startDate ? new Date(startDate) : new Date(currentYear, 0, 1); // Jan 1
    const end = endDate ? new Date(endDate) : new Date(currentYear, 11, 31); // Dec 31

    // Adjust to cover full months
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    // Fetch earnings for completed bookings
    const earnings = await Booking.aggregate([
      {
        $match: {
          checkIn: { $gte: start, $lte: end },
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$checkIn" } },
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate all months in range
    const allMonths = [];
    let current = new Date(start);
    while (current <= end) {
      const monthId = `${current.getFullYear()}-${(current.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      allMonths.push(monthId);
      current.setMonth(current.getMonth() + 1);
    }

    // Format response with all months
    const result = allMonths.map((monthId) => {
      const earning = earnings.find((e) => e._id === monthId) || {
        totalEarnings: 0,
      };
      return { _id: monthId, totalEarnings: earning.totalEarnings };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
};

const getBookingCount = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Set date range (default to current year)
    const currentYear = new Date().getFullYear();
    const start = startDate ? new Date(startDate) : new Date(currentYear, 0, 1); // Jan 1
    const end = endDate ? new Date(endDate) : new Date(currentYear, 11, 31); // Dec 31

    // Adjust to cover full months
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    // Fetch completed bookings
    const bookings = await Booking.aggregate([
      {
        $match: {
          checkIn: { $gte: start, $lte: end },
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$checkIn" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate all months in range
    const allMonths = [];
    let current = new Date(start);
    while (current <= end) {
      const monthId = `${current.getFullYear()}-${(current.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      allMonths.push(monthId);
      current.setMonth(current.getMonth() + 1);
    }

    // Format response with all months
    const result = allMonths.map((monthId) => {
      const booking = bookings.find((b) => b._id === monthId) || { count: 0 };
      return { _id: monthId, count: booking.count };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking count" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ bookingId, userId });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or you are not authorized" });
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // Check if booking is in a cancellable state
    if (booking.status !== "upcoming" && booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot cancel booking in current status" });
    }

    const currentDate = moment();
    const checkInDate = moment(booking.checkIn);
    const daysUntilCheckIn = checkInDate.diff(currentDate, "days");

    // Check if cancellation is allowed (at least 1 day before check-in)
    if (daysUntilCheckIn < 1) {
      return res.status(400).json({
        message:
          "Booking can only be cancelled at least one day before check-in",
      });
    }

    // Update booking status to cancelled
    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res
      .status(500)
      .json({ message: "Server error while cancelling booking" });
  }
};

module.exports = {
  makeBooking,
  getUserBooking,
  getSingleBooking,
  getGuestsForHost,
  getUserCompletedBooking,
  updateBookingStatus,
  startStatusUpdateScheduler,
  checkBookingAvailability,
  getAllBookings,
  monthlyBookingReport,
  deleteBooking,
  getEarnings,
  getBookingCount,
  cancelBooking,
};
