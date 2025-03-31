const Property = require("../model/Property");
const Address = require("../model/Address");
const fs = require("fs");
const path = require("path");
const User = require("../model/User");
const Review = require("../model/Review");
const Booking = require("../model/Booking");

const getSingleProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("addressId")
      .populate("hostId");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Get reviews and calculate rating statistics for this property
    const reviews = await Review.find({ propertyId: req.params.id }).populate(
      "userId"
    );

    // Calculate average rating and total number of reviews
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Prepare the property object with review stats
    const propertyData = {
      ...property.toObject(),
      reviewStats: {
        averageRating: Number(averageRating.toFixed(1)), // Round to 1 decimal place
        totalReviews: totalReviews,
        reviews: reviews.map((review) => ({
          _id: review._id,
          title: review.title,
          rating: review.rating,
          reviewText: review.reviewText,
          createdAt: review.createdAt,
          user: {
            _id: review.userId._id,
            FirstName: review.userId.FirstName,
            LastName: review.userId.LastName,
          },
        })),
      },
    };

    res.status(200).json({ property: propertyData });
  } catch (error) {
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  const userId = req.user._id;

  if (!req.files || !req.files.images) {
    return res.status(400).send({ msg: "No images were uploaded" });
  }

  const imageFiles = req.files.images;

  // Ensure that at least 5 images are uploaded
  // (Handles both array and single file cases)
  if (Array.isArray(imageFiles)) {
    if (imageFiles.length < 5) {
      return res
        .status(400)
        .send({ message: "You must upload at least 5 images" });
    }
  } else {
    // If a single file is provided, it won't have a length property
    return res
      .status(400)
      .send({ message: "You must upload at least 5 images" });
  }

  let imagePaths = [];

  // Process address details first
  const { street, city, province_id, zipCode } = req.body;

  const address = new Address({
    street,
    city,
    province_id,
    zipCode,
  });

  try {
    const savedAddress = await address.save();
    console.log("Saved address ID:", savedAddress._id);

    // Prepare an array of promises for file uploads
    const uploadPromises = imageFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const fileName = Date.now() + "-" + file.name; // Avoid name collisions
        const destination = path.join(path.resolve(), "uploads", fileName);

        file.mv(destination, (err) => {
          if (err) {
            reject(err);
          } else {
            // Push the file name to the imagePaths array
            imagePaths.push(fileName);
            resolve();
          }
        });
      });
    });

    // Wait until all file uploads are done
    await Promise.all(uploadPromises);
    const amenities = req.body["amenities[]"] || [];

    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : [amenities].filter(Boolean);

    // Now that all images are uploaded, create the property
    const newProperty = new Property({
      hostId: userId,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      maxGuest: req.body.maxGuest,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      kitchen: req.body.kitchen,
      images: imagePaths,
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      addressId: savedAddress._id,
      amenities: amenitiesArray,
    });

    const property = await newProperty.save();
    return res
      .status(201)
      .send({ message: "Property created successfully", property });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .send({ message: "Error saving property or address", error: err });
  }
};

// Route to get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      is_active: true,
      status: "approved",
    })
      .populate("addressId", "street city")
      .exec();

    if (properties.length === 0) {
      return res.status(404).send({ message: "No properties found" });
    }

    const modifiedProperties = properties.map((property) => {
      const { longitude, latitude, images, ...rest } = property.toObject(); // Exclude longitude, latitude, and images except the first one
      const firstImage = images && images[0]; // Get only the first image
      return {
        ...rest,
        images: firstImage ? [firstImage] : [], // Include only the first image if exists
      };
    });

    // Send the properties as a response
    res.status(200).send({
      message: "Properties fetched successfully",
      properties: modifiedProperties,
    });
  } catch (err) {
    res.status(500).send({ message: "Error fetching properties", error: err });
  }
};

const getHostproperties = async (req, res) => {
  try {
    const userId = req.user._id; // Extract the hostId from route params
    console.log("Host ID:", userId);
    if (!userId) {
      return res.status(400).json({ message: "Host ID is required" });
    }

    const properties = await Property.find({ hostId: userId })
      .populate("addressId", "street city")
      .exec();

    if (!properties || properties.length === 0) {
      return res
        .status(404)
        .json({ message: "No properties found for this host" });
    }

    res.status(200).json({ properties });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

const editProperty = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      title,
      description,
      price,
      addressId,
      address,
      maxGuest,
      bedrooms,
      bathrooms,
      kitchen,
      images,
      longitude,
      latitude,
    } = req.body;

    const amenities = req.body["amenities[]"] || [];
    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : [amenities].filter(Boolean);

    console.log("Received address:", address);
    if (typeof address === "string") {
      console.log("Address is received as a string:", address);
      // Optionally parse stringified address if it's in JSON string format
      address = JSON.parse(address); // This will work now
    }

    console.log("Updating address ID:", addressId);
    console.log("New address data:", address);

    // Validate and update the address if addressId is provided
    if (addressId && address) {
      const existingAddress = await Address.findById(addressId);
      if (!existingAddress) {
        return res.status(400).json({ message: "Invalid address ID." });
      }

      // Use $set to update only specified fields
      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        { $set: address },
        { new: true, runValidators: true }
      );

      if (!updatedAddress) {
        return res.status(400).json({ message: "Failed to update address." });
      }

      console.log("Updated address:", updatedAddress);
    }

    // Update Property
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        maxGuest,
        bedrooms,
        bathrooms,
        kitchen,
        images,
        addressId,
        longitude,
        latitude,
        amenities: amenitiesArray,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found." });
    }

    res.status(200).json({
      message: "Property and Address updated successfully",
      updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const uploadImage = async (req, res) => {
  const propertyId = req.params.propertyId;

  // Check if files are provided
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  try {
    const uploadedFiles = req.files.images; // 'images' field from form

    // Ensure multiple files are handled as an array
    const filesArray = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : [uploadedFiles];

    // Array to store image file names after upload
    const imagePaths = [];

    // Ensure the 'uploads' directory exists
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Create promises for each file upload
    const uploadPromises = filesArray.map((file) => {
      return new Promise((resolve, reject) => {
        const fileName = Date.now() + "-" + file.name; // Generate unique file name
        const destination = path.join(uploadDir, fileName); // Destination path

        // Move file to the uploads directory
        file.mv(destination, (err) => {
          if (err) {
            reject(err); // Reject if an error occurs during the move
          } else {
            imagePaths.push(fileName); // Add the file name to the imagePaths array
            resolve(); // Resolve when file upload is successful
          }
        });
      });
    });

    // Wait for all file uploads to finish
    await Promise.all(uploadPromises);

    // Update the property with new image paths in the database
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $push: { images: { $each: imagePaths } } },
      { new: true }
    );

    // Only return the uploaded image paths (file names)
    res.status(200).json({
      message: "Images uploaded successfully",
      images: imagePaths, // Return only the uploaded image names
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).send("Error uploading images: " + error.message);
  }
};

const deleteImage = async (req, res) => {
  const propertyId = req.params.propertyId;
  const { imagePath } = req.body; // Image path to delete

  if (!imagePath) {
    return res.status(400).json({ message: "Image path is required" });
  }

  try {
    // Check if the image exists on the disk
    const filePath = path.join(
      __dirname,
      "..",
      "uploads/properties",
      imagePath
    );
    console.log(filePath);
    if (fs.existsSync(filePath)) {
      // Delete the image from the file system
      fs.unlinkSync(filePath); // Synchronously delete the file
    } else {
      return res.status(404).json({ message: "Image not found on server" });
    }

    // Remove the image path from the database (property document)
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $pull: { images: imagePath } }, // Pull the image path from the images array
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Image deleted successfully", property });
  } catch (error) {
    console.error("Error deleting image:", error);
    res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
};

const pendingApproval = async (req, res) => {
  try {
    const pendingProperties = await Property.find({ status: "pending" })
      .populate("addressId", "street city")
      .exec();

    res.status(200).json({
      success: true,
      count: pendingProperties.length,
      properties: pendingProperties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const approveOrRejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { hostId, status } = req.body;

    if (!hostId || !status) {
      return res
        .status(400)
        .json({ message: "Host ID and status are required" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'approved' or 'rejected'." });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const host = await User.findById(hostId);
    if (!host) {
      return res
        .status(404)
        .json({ message: `Host not found. User ID: ${hostId}` });
    }

    // Check if host is approved before approving a property
    if (status === "approved" && host.hostApprovalStatus !== "approved") {
      return res.status(403).json({
        message: `User ${host.FirstName} is not an approved host. Property cannot be approved.`,
      });
    }

    // Update the property's status
    property.status = status;
    await property.save();

    return res
      .status(200)
      .json({ message: `Property ${status} successfully`, property });
  } catch (error) {
    console.error("Error updating property status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchProperties = async (req, res, next) => {
  console.log(req.query);

  let searchTerm = req.query.searchTerm || "";
  let minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  let maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
  let pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let amenities = req.query.amenities ? req.query.amenities.split(",") : [];
  let checkIn = req.query.checkIn;
  let checkOut = req.query.checkOut;
  let maxGuests = req.query.guests ? parseInt(req.query.guests) : null; // New filter for maxGuests

  // Room filters
  let minBedrooms = req.query.bedrooms ? parseInt(req.query.bedrooms) : null;
  let exactBedrooms = req.query.bedrooms ? parseInt(req.query.bedrooms) : null;
  let minBathrooms = req.query.bathrooms ? parseInt(req.query.bathrooms) : null;
  let exactBathrooms = req.query.bathrooms ? parseInt(req.query.bathrooms) : null;

  try {
    let filterOptions = {
      is_active: true,
      status: "approved",
    };

    // Apply price filters
    if (minPrice !== null || maxPrice !== null) {
      filterOptions.price = {};
      if (minPrice !== null) filterOptions.price.$gte = minPrice;
      if (maxPrice !== null) filterOptions.price.$lte = maxPrice;
    }

    // Apply room filters (Greater than or equal OR exact match)
    if (exactBedrooms !== null) {
      filterOptions.bedrooms = exactBedrooms; // Exact match
    } else if (minBedrooms !== null) {
      filterOptions.bedrooms = { $gte: minBedrooms };
    }

    if (exactBathrooms !== null) {
      filterOptions.bathrooms = exactBathrooms;
    } else if (minBathrooms !== null) {
      filterOptions.bathrooms = { $gte: minBathrooms };
    }

    // Filter by number of guests
    if (maxGuests !== null) {
      filterOptions.maxGuest = { $gte: maxGuests }; // Ensure the property can accommodate at least the specified number of guests
    }

    // Filter by City (Using Address Collection)
    if (searchTerm) {
      const cityAddresses = await Address.find({
        city: new RegExp(searchTerm, "i"),
      }).distinct("_id");
      filterOptions.addressId = { $in: cityAddresses };
    }

    // Filter by Amenities
    if (amenities.length > 0) {
      filterOptions.amenities = { $all: amenities };
    }

    // Filter by Availability (Check-in & Check-out)
    if (checkIn && checkOut) {
      const bookedProperties = await Booking.find({
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) },
      }).distinct("propertyId");

      filterOptions._id = { $nin: bookedProperties };
    }

    let total = await Property.countDocuments(filterOptions);
    let properties = await Property.find(filterOptions)
      .populate("addressId")
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({ total, properties });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  getHostproperties,
  editProperty,
  uploadImage,
  deleteImage,
  pendingApproval,
  approveOrRejectProperty,
  searchProperties,
};
