const Review = require("../model/Review");
const Booking = require("../model/Booking");
const Property = require("../model/Property");
const mongoose = require("mongoose");
const User = require("../model/User");  
const { ObjectId } = mongoose.Types;

const makeReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookingId, propertyId, rating,  reviewText } = req.body;

    if (!bookingId || !propertyId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: {
          bookingId: !bookingId && "Booking ID is required",
          propertyId: !propertyId && "Property ID is required",
          rating: !rating && "Rating is required",
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
    const count = await Review.countDocuments({});
    const reviewId = `R-${count + 1}`;
    // Create new review instance
    const newReview = new Review({
      reviewId,
      bookingId,
      propertyId,
      userId,
      rating,

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
        select: "FirstName LastName profileImage", // Only include firstName and lastName
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
            profileImage: review.userId.profileImage,
          },
        })),
      },
    };

    res.status(200).json({ property: propertyData });
  } catch (error) {
    next(error);
  }
};

const getAllReviews = async (req, res) => {
  try {
    const {
      searchTerm = "",
      minRating = null,
      maxRating = null,
      propertyId = null,
      userId = null,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      pageSize = 10,
    } = req.query;

    let filterOptions = {};

    // Apply rating filters
    if (minRating !== null || maxRating !== null) {
      filterOptions.rating = {};
      if (minRating !== null) filterOptions.rating.$gte = parseInt(minRating);
      if (maxRating !== null) filterOptions.rating.$lte = parseInt(maxRating);
    }

    // Apply propertyId and userId filters (ObjectId)
    if (propertyId) filterOptions.propertyId = propertyId;
    if (userId) filterOptions.userId = userId;

    // Handle search by reviewId, userId.userId, or propertyId.title
    if (searchTerm && searchTerm.trim() !== "") {
      // Find properties with matching title
      const matchingProperties = await Property.find({
        title: { $regex: new RegExp(searchTerm, "i") },
      }).distinct("_id");

      // Find users with matching userId
      const matchingUsers = await User.find({
        UserId: { $regex: new RegExp(searchTerm, "i") },
      }).distinct("_id");

      filterOptions.$or = [
        { reviewId: { $regex: new RegExp(searchTerm, "i") } },
        { userId: { $in: matchingUsers } },
        { propertyId: { $in: matchingProperties } },
      ];
    }

    // Set sort options
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    // Get total count for pagination
    const total = await Review.countDocuments(filterOptions);

    // Fetch paginated reviews
    const reviews = await Review.find(filterOptions)
      .populate("userId", "FirstName LastName UserId")
      .populate("propertyId", "title propertyId")
      .sort(sortOptions)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize))
      .exec();

    if (reviews.length === 0) {
      return res.status(404).send({ message: "No reviews found" });
    }

    // Modify reviews for response
    const modifiedReviews = reviews.map((review) => {
      const { _id, userId, propertyId, ...rest } = review.toObject();
      return {
        _id,
        ...rest,
        user: `${userId?.FirstName || ""} ${userId?.LastName || ""}`.trim(),
        userId: userId?.UserId || "N/A",
        propertyTitle: propertyId?.title || "N/A",
        propertyId: propertyId?.propertyId || "N/A",
      };
    });

    res.status(200).send({
      message: "Reviews fetched successfully",
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      reviews: modifiedReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

const deleteReviews = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Get total count of user reviews
    const totalReviews = await Review.countDocuments({ userId });

    // Get paginated reviews
    const reviews = await Review.find({ userId })
      .populate({
        path: "propertyId",
        select: "title images", // Added images to show property thumbnail
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      message: "User reviews fetched successfully",
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user reviews",
      error: error.message,
    });
  }
};

module.exports = {
  makeReview,
  getSinglePropertyReview,
  getAllReviews,
  deleteReviews,
  getUserReviews,
};
