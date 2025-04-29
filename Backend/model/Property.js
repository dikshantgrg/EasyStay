const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.ObjectId;

const propertySchema = new Schema({
  propertyId: {
    type: String,
    unique: true,
    required: true,
  },
  hostId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  PropertyTypeId: {
    type: ObjectId,
    required: true,
    ref: "PropertyType",
  },
  addressId: {
    type: ObjectId,
    required: true,
    ref: "Address",
  },
  maxGuest: {
    type: Number,
    required: true,
    min: 1,
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0,
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0,
  },
  kitchen: {
    type: Number,
    required: true,
    min: 0,
  },
  images: {
    type: [String],
    validate: {
      validator: function (images) {
        return images.length > 0;
      },
      message: "At least one image is required",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  amenities: {
    type: [String], 
    default: [], 
  },
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
