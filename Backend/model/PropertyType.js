const mongoose = require('mongoose');

const propertyTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const PropertyType = mongoose.model('PropertyType', propertyTypeSchema);

module.exports = PropertyType;
