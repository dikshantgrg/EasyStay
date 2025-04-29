require("dotenv").config();
const axios = require("axios");
const Payment = require("../model/Payment");
const { sendEmail } = require("../utils/emailConfig");
const Booking = require("../model/Booking");

const KhaltiURL = process.env.KHALTI_GATEWAY_URL;
const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

const initiateKhaltiPayment = async ({ bookingId, totalPrice, user }) => {
  try {
    console.log("khaltiSecretKey", khaltiSecretKey);
    const paymentData = {
      return_url: "http://localhost:5173/booking/success/",
      website_url: "http://localhost:5173/",
      amount: totalPrice * 100, // Amount in paisa
      purchase_order_id: bookingId,
      purchase_order_name: "Property Booking",
      customer_info: {
        name: `${user.FirstName} ${user.LastName} ` || "Guest",
        email: user.Email || "guest@example.com",
        phone: user.phoneNumber || "",
      },
    };

    const response = await axios.post(`${KhaltiURL}/initiate/`, paymentData, {
      headers: {
        Authorization: `key ${khaltiSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const { pidx, payment_url } = response.data;
    return { paymentUrl: payment_url, pidx };
  } catch (err) {
    console.error(
      "Payment initiation error:",
      err.response ? err.response.data : err.message
    );
    throw new Error(`Payment initiation failed: ${err.message}`);
  }
};

const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, transaction_id, amount, purchase_order_id } = req.query;
    console.log("Query parameters:", req.query);

    // Validate inputs
    if (!pidx || !purchase_order_id || typeof purchase_order_id !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid pidx or purchase_order_id." });
    }

    console.log("Khalti URL:", KhaltiURL);
    const verifyResponse = await axios.post(
      `${KhaltiURL}/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const paymentStatus = verifyResponse.data.status;
    console.log("Payment status:", paymentStatus);

    if (paymentStatus === "Completed") {
      // Update payment and fetch user
      const payment = await Payment.findOneAndUpdate(
        { bookingId: purchase_order_id },
        {
          paymentStatus: "completed",
          transactionId: transaction_id,
          paymentDate: new Date(),
        },
        { new: true }
      ).populate("userId");

      if (!payment) {
        return res.status(404).json({ error: "Payment record not found." });
      }

      // Fetch booking using bookingId
      const booking = await Booking.findOne({
        bookingId: purchase_order_id,
      }).populate({
        path: "propertyId",
        select: "title",
        populate: [
          {
            path: "addressId",
            select: "city street",
          },
          {
            path: "hostId",
            select: "FirstName phoneNumber",
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({ error: "Booking record not found." });
      }

      // Format dates for better readability
      const checkInDate = new Date(booking.checkIn).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      const checkOutDate = new Date(booking.checkOut).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      // Send confirmation email
      const emailHtml = `
        <h1>Booking Confirmation</h1>
        <p>Dear ${payment.userId.FirstName},</p>
        <p>Your booking has been confirmed and payment has been successfully processed.</p>
        
        <h2>Booking Details:</h2>
        <ul>
          <li>Booking ID: ${booking.bookingId}</li>
          <li>Property: ${booking.propertyId.title}</li>
          <li>Address: ${booking.propertyId.addressId.city},${
        booking.propertyId.addressId.street
      }</li>
       <li>Host Name and Contact: ${booking.propertyId.hostId.FirstName}, ${
        booking.propertyId.hostId.phoneNumber
      }</li>

          <li>Check-in Date: ${checkInDate}</li>
          <li>Check-out Date: ${checkOutDate}</li>
        </ul>

        <h2>Payment Details:</h2>
        <ul>
          <li>Transaction ID: ${transaction_id}</li>
          <li>Amount Paid: NPR ${amount / 100}</li>
          <li>Payment Date: ${new Date().toLocaleDateString()}</li>
        </ul>

       
        <p>Thank you for choosing EasyStay! We hope you enjoy your stay.</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
      `;

      await sendEmail(
        payment.userId.Email,
        "Booking Confirmation - EasyStay",
        emailHtml
      );

      res.redirect("http://localhost:5173/booking/success");
    } else if (paymentStatus === "User canceled") {
      const payment = await Payment.findOne({ bookingId: purchase_order_id });
      const booking = await Booking.findOne({ bookingId: purchase_order_id });

      if (payment && booking) {
        await Payment.deleteOne({ bookingId: purchase_order_id });
        await Booking.deleteOne({ bookingId: purchase_order_id });
        console.log(
          `Payment and booking deleted for bookingId: ${purchase_order_id} due to user cancellation`
        );
      }
      res.redirect("http://localhost:5173/booking/canceled");
    } else {
      await Payment.findOneAndUpdate(
        { bookingId: purchase_order_id },
        { paymentStatus: "failed" }
      );
      res.redirect("http://localhost:5173/booking/failed");
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log(
        `Payment with pidx ${req.query.pidx} not found, treating as user canceled`
      );
      const { purchase_order_id } = req.query;
      const payment = await Payment.findOne({ bookingId: purchase_order_id });
      const booking = await Booking.findOne({ bookingId: purchase_order_id });

      if (payment && booking) {
        await Payment.deleteOne({ bookingId: purchase_order_id });
        await Booking.deleteOne({ bookingId: purchase_order_id });
        console.log(
          `Payment and booking deleted for bookingId: ${purchase_order_id} due to user cancellation`
        );
      }
      res.redirect("http://localhost:5173/booking/canceled");
    } else {
      console.error("Error verifying payment:", err.message);
      res.status(500).json({
        error: "Payment verification failed.",
        details: err.message,
      });
    }
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // Filter setup
    const filter = {};

    // Search by bookingId or transactionId (partial match)
    if (req.query.searchTerm) {
      const searchRegex = { $regex: req.query.searchTerm, $options: "i" };
      filter.$or = [
        { bookingId: searchRegex },
        { transactionId: searchRegex },
        {
          paymentId: searchRegex,
        },
      ];
    }

    // Payment status filter
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    // Date range filter for paymentDate
    if (req.query.startDate || req.query.endDate) {
      filter.paymentDate = {};
      if (req.query.startDate) {
        filter.paymentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filter.paymentDate.$lte = endDate;
      }
    }

    // Sorting setup
    const sortBy = req.query.sortBy || "paymentDate"; // Default to paymentDate
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // asc: 1, desc: -1
    const sort = { [sortBy]: sortOrder }; // Dynamic sort object

    const payments = await Payment.find(filter)
      .populate("userId", "FirstName LastName Email UserId")
      .skip(skip)
      .limit(pageSize)
      .sort(sort);

    const total = await Payment.countDocuments(filter);

    if (payments.length === 0) {
      return res.status(200).json({
        payments: [],
        page,
        pageSize,
        total,
      });
    }

    res.status(200).json({
      payments,
      page,
      pageSize,
      total,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  getAllPayments,
};
