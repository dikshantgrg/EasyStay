require("dotenv").config();
const axios = require("axios");
const Payment = require("../model/Payment");

const KhaltiURL = process.env.KHALTI_GATEWAY_URL;
const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;

const initiateKhaltiPayment = async ({ bookingId, totalPrice, user }) => {
  try {
    console.log("khaltiSecretKey", khaltiSecretKey);
    const paymentData = {
      return_url: "http://localhost:5173/booking/success/", // Replace with your callback URL
      website_url: "http://localhost:5173/", // Replace with your website URL
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

    if (paymentStatus === "Completed") {
      const payment = await Payment.findOneAndUpdate(
        { bookingId: purchase_order_id },
        {
          paymentStatus: "completed",
          transactionId: transaction_id,
          paymentDate: new Date(),
        },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ error: "Payment record not found." });
      }

      res.redirect("http://localhost:5173/booking/success");
    } else if (paymentStatus === "User canceled") {
      // Note: Khalti uses "User canceled" not "User Cancelled"
      const payment = await Payment.findOne({ bookingId: purchase_order_id });
      const booking = await Booking.findOne({ _id: purchase_order_id });

      if (payment && booking) {
        await Payment.deleteOne({ bookingId: purchase_order_id });
        await Booking.deleteOne({ _id: purchase_order_id });
        console.log(
          `Payment and booking deleted for bookingId: ${purchase_order_id} due to user cancellation`
        );
      }

      res.redirect("http://localhost:5173/booking/failure");
    } else {
      await Payment.findOneAndUpdate(
        { bookingId: purchase_order_id },
        { paymentStatus: "failed" }
      );
      res.redirect("http://localhost:5173/booking/failure");
    }
  } catch (err) {
    console.error("Error verifying payment:", err.message);
    res
      .status(500)
      .json({ error: "Payment verification failed.", details: err.message });
  }
};

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
};
