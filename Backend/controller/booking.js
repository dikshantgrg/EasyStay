const Booking = require("../model/Booking");
const User = require("../model/User");
const Property = require("../model/Property");
const moment = require("moment");

const makeBooking = async (req, res) => {
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

    // All caps unique booking ID
    const bookingId = `BK-${Date.now()
      .toString(36)
      .toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const newBooking = new Booking({
      bookingId,
      propertyId,
      userId,
      hostId,
      checkIn,
      checkOut,
      totalGuest,
      totalPrice,
    });

    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully.",
      booking: newBooking,
    });
  } catch (err) {
    console.error("Error making booking:", err.message);
    res.status(500).json({ error: "Server error.", details: err.message });
  }
};

const getUserBooking = async (req, res) => {
  const userid = req.user._id;

  try {
    const bookings = await Booking.find({ userId: userid })
      .populate({
        path: "propertyId",
        populate: {
          path: "addressId",
        },
      })
      .populate("hostId");

    res.status(200).json({
      message: "User bookings fetched successfully.",
      bookings,
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
  console.log(category);
  try {
    const hostId = req.user._id;

    const currentDate = moment().toDate();
    const nextWeek = moment().add(7, "days").toDate();

    let filter = {};

    // Apply filters based on the category
    switch (category) {
      case "Checking Out":
        filter = {
          hostId: hostId,
          checkOut: { $lte: currentDate },
          status: { $ne: "completed" } // Exclude completed bookings
        };
        break;

      case "Current Guest":
        filter = {
          hostId: hostId,
          checkIn: { $lte: currentDate },
          checkOut: { $gte: currentDate },
          status: { $ne: "completed" }
        };
        break;

      case "Arriving Soon":
        filter = {
          hostId: hostId,
          checkIn: { $gt: currentDate, $lte: nextWeek },
          status: { $ne: "completed" }
        };
        break;

      case "Upcoming":
        filter = {
          hostId: hostId,
          checkIn: { $gt: nextWeek },
          status: { $ne: "completed" }
        };
        break;

      case "Completed":
        filter = {
          hostId: hostId,
          status: "completed"
        };
        break;

      default:
        return res.status(400).json({ message: "Invalid category" });
    }

    // Query the Booking model and populate the property details
    const reservations = await Booking.find(filter)
      .populate({
        path: "propertyId",
        populate: {
          path: "addressId",
        },
      })
      .populate("userId");

    // Prepare categorized data with completed category
    const categorizedData = {
      checkingOut: [],
      currentGuest: [],
      arrivingSoon: [],
      upcoming: [],
      completed: []
    };

    // Sort data into categories
    reservations.forEach((reservation) => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);

      if (reservation.status === "completed") {
        categorizedData.completed.push(reservation);
      } else if (checkOut <= currentDate) {
        categorizedData.checkingOut.push(reservation);
      } else if (checkIn <= currentDate && checkOut >= currentDate) {
        categorizedData.currentGuest.push(reservation);
      } else if (checkIn > currentDate && checkIn <= nextWeek) {
        categorizedData.arrivingSoon.push(reservation);
      } else if (checkIn > nextWeek) {
        categorizedData.upcoming.push(reservation);
      }
    });

    // Respond with categorized reservations
    return res.status(200).json({
      message: "Reservations fetched successfully",
      data: categorizedData,
    });
  } catch (error) {
    console.error("Error fetching guest reservations:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserCompletedBooking = async (req, res) => {
  const userid = req.user._id;

  try {
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
      .populate("hostId");

    if (bookings.length === 0) {
      return res.status(404).json({ error: "No completed bookings found." });
    }

    res.status(200).json({
      message: "User completed bookings fetched successfully.",
      bookings,
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

module.exports = {
  makeBooking,
  getUserBooking,
  getSingleBooking,
  getGuestsForHost,
  getUserCompletedBooking,
  updateBookingStatus,
  startStatusUpdateScheduler,
};
