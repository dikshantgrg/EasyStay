const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const PaymentSchema = new Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true,
  },
  bookingId: {
    type: String,
    ref: "Booking", 
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  paymentIdx: {
    type: String, // Khalti payment index (pidx)
  },
  transactionId: {
    type: String, // Khalti transaction ID
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    default: "Khalti",
  },
  paymentDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;