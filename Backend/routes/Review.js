const express = require("express");
const {
  makeReview,
  getSinglePropertyReview,
  getAllReviews,
  deleteReviews,
  getUserReviews,
} = require("../controller/Review");
const { checkAuthorization, isHost, isAdmin } = require("../middleware/auth");
const router = express.Router();


// for guest
router.post("/api/review", checkAuthorization, makeReview);
router.get("/api/user-review", checkAuthorization, getUserReviews);


// for host
router.get(
  "/api/host/property-review/:id",
checkAuthorization, isHost,
  getSinglePropertyReview
);

// for admin
router.get("/api/admin/property-review",checkAuthorization, isAdmin, getAllReviews);
router.delete(
  "/api/admin/delete-review/:id",
  checkAuthorization, isAdmin,    
  deleteReviews
);

module.exports = router;
