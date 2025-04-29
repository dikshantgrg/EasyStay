const PropertyType = require("../model/PropertyType");

const addPropertyType = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const propertyType = new PropertyType({
      title,
    });
    await propertyType.save();
    res.status(201).json(propertyType); // Added response for successful creation
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPropertyTypes = async (req, res) => {
  try {
    // Check if PropertyType is a valid model
   
    
    const propertyTypes = await PropertyType.find({});
    res.status(200).json(propertyTypes);
  } catch (error) {
    console.error("Error fetching property types:", error);
    res.status(400).json({ message: error.message });
  }
};

const updatePropertyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const propertyType = await PropertyType.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );
    if (!propertyType) {
      return res.status(404).json({ message: "Property type not found" });
    }
    res.status(200).json(propertyType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePropertyType = async (req, res) => {
  try {
    const { id } = req.params;
    const propertyType = await PropertyType.findByIdAndDelete(id);
    if (!propertyType) {
      return res.status(404).json({ message: "Property type not found" });
    }
    res.status(200).json({ message: "Property type deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addPropertyType,
  getPropertyTypes,
  updatePropertyType,
  deletePropertyType,
};