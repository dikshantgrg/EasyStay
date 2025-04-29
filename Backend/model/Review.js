const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const reviewSchema = new Schema({
  reviewId: {
    type: String,
    unique: true,
    required: true,
  },
  bookingId: {
    type: ObjectId,
    ref: "Booking",
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
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },

  reviewText: {
    type: String,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
