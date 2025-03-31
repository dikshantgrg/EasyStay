const express = require("express");
const {
  makeReview,
  getSinglePropertyReview,
  getAllReviews,
} = require("../controller/Review");
const { checkAuthorization } = require("../middleware/auth");
const router = express.Router();

router.post("/api/review", checkAuthorization, makeReview);

// for host
router.get(
  "/api/host/property-review/:id",
  checkAuthorization,
  getSinglePropertyReview
);

// for admin
router.get("/api/admin/property-review",  getAllReviews);

module.exports = router;
