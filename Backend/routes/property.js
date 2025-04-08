const express = require("express");
const {
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
} = require("../controller/property");
const { checkAuthorization } = require("../middleware/auth");
const router = express.Router();

// Create a new property
router.post("/api/properties", checkAuthorization, createProperty);
router.get("/api/properties", getAllProperties);
router.get("/api/property/:id", getSingleProperty);
router.get("/api/search", searchProperties);
// for host
router.get("/api/properties/host", checkAuthorization, getHostproperties);

router.put("/api/edit/property/:id", editProperty);
router.post("/api/upload-images/:propertyId", uploadImage);
router.delete("/api/delete/:propertyId", deleteImage);



// for admin

router.get("/api/admin/pending-approval", pendingApproval);
router.put("/api/admin/property-status/:id", approveOrRejectProperty);

module.exports = router;
