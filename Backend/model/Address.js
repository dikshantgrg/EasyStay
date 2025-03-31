const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  province_id: {
    type: Number, 
    required: true,
    ref: "Province", 
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{4,6}$/.test(v); // Adjust regex based on zip code format requirements
      },
      message: "Invalid zip code format",
    },
  },
});

module.exports = mongoose.model("Address", AddressSchema);
