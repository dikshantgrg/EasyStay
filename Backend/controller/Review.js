const Review = require("../model/Review");
const Booking = require("../model/Booking");
const Property = require("../model/Property");
const { default: mongoose } = require("mongoose");

const makeReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId, propertyId, rating, title, reviewText } = req.body;

    if (!bookingId || !propertyId || !rating || !title) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: {
          bookingId: !bookingId && "Booking ID is required",
          propertyId: !propertyId && "Property ID is required",
          rating: !rating && "Rating is required",
          title: !title && "Title is required",
        },
      }); // Fixed syntax: removed extra comma and closing brace
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    if (booking.hasReviewed) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // Create new review instance
    const newReview = new Review({
      bookingId,
      propertyId,
      userId,
      rating,
      title,
      reviewText,
    });

    await newReview.save();

    await Booking.findByIdAndUpdate(
      bookingId,
      { hasReviewed: true },
      { new: true } // Return the updated document (optional)
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getSinglePropertyReview = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("addressId")
      .populate("hostId");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Pagination setup
    const page = parseInt(req.query.page) || 1; // default to page 1
    const limit = parseInt(req.query.limit) || 6; // default to 5 reviews per page
    const skip = (page - 1) * limit;

    // Get paginated reviews with userId populated (firstName and lastName only)
    const reviews = await Review.find({ propertyId: req.params.id })
      .sort({ createdAt: -1 }) // optional: latest reviews first
      .populate({
        path: "userId",
        select: "FirstName LastName", // Only include firstName and lastName
      })
      .skip(skip)
      .limit(limit);

    // Get total reviews
    const totalReviews = await Review.countDocuments({
      propertyId: req.params.id,
    });

    // Calculate average rating without aggregate
    let averageRating = 0;
    if (totalReviews > 0) {
      const allReviews = await Review.find({ propertyId: req.params.id }); // Fetch all reviews temporarily
      const totalRating = allReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = totalRating / totalReviews;
    }

    // Prepare the response data
    const propertyData = {
      ...property.toObject(),
      reviewStats: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        reviews: reviews.map((review) => ({
          _id: review._id,
          title: review.title,
          rating: review.rating,
          reviewText: review.reviewText,
          createdAt: review.createdAt,
          userId: {
            _id: review.userId._id,
            firstName: review.userId.FirstName,
            lastName: review.userId.LastName,
          },
        })),
      },
    };

    res.status(200).json({ property: propertyData });
  } catch (error) {
    next(error);
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const review = await Review.find({}).populate("userId").populate("propertyId");

    if (review.length === 0) {
      return res.status(404).send({ message: "No Review found" });
    }

    res.status(200).json({ review });
  } catch (error) {
    next(error);
  }
};

module.exports = { makeReview, getSinglePropertyReview, getAllReviews };
