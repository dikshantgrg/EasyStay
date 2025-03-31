const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const BookingSchema = new Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },

  propertyId: {
    type: ObjectId,
    ref: "Property",
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  hostId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.checkIn;
      },
      message: "Check-out date must be after check-in date",
    },
  },

  totalGuest: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },

  status: {
    type: String,
    enum: ["upcoming", "active", "completed"],
    default: "upcoming",
  },
  hasReviewed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
