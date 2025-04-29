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
  getAllActiveProperties,
  getTopPropertise,
  deleteProperty,
  toggleActiveStatus,
} = require("../controller/property");
const { checkAuthorization, isHost, isAdmin } = require("../middleware/auth");
const router = express.Router();

// Create a new property
router.get("/api/properties", getAllActiveProperties);
router.get("/api/property/:id", getSingleProperty);
router.get("/api/search", searchProperties);

// for host
router.post("/api/properties", checkAuthorization, isHost, createProperty);
router.get(
  "/api/properties/host",
  checkAuthorization,
  isHost,
  getHostproperties
);
router.put("/api/edit/property/:id", checkAuthorization, isHost, editProperty);
router.put(
  "/api/host/toggle-active/:id",
  checkAuthorization,
  isHost,
  toggleActiveStatus
);
router.post(
  "/api/upload-images/:propertyId",
  checkAuthorization,
  isHost,
  uploadImage
);
router.delete(
  "/api/delete/:propertyId",
  checkAuthorization,
  isHost,
  deleteImage
);
router.delete(
  "/api/delete-property/:id",
  checkAuthorization,
  isHost,
  deleteProperty
);

// for admin

router.get(
  "/api/admin/pending-approval",
  checkAuthorization,
  isAdmin,
  pendingApproval
);
router.put(
  "/api/admin/property-status/:id",
  checkAuthorization,
  isAdmin,
  approveOrRejectProperty
);
router.get(
  "/api/admin/properties",
  checkAuthorization,
  isAdmin,
  getAllProperties
);
router.get(
  "/api/admin/top-propertise",
  checkAuthorization,
  isAdmin,
  getTopPropertise
);
router.delete(
  "/api/admin/delete-property/:id",
  checkAuthorization,
  deleteProperty
);

module.exports = router;
