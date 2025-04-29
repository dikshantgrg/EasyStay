const express = require("express");
const {
  verifyKhaltiPayment,
  getAllPayments,
} = require("../controller/paymentController");
const { checkAuthorization } = require("../middleware/auth");
const router = express.Router();

router.get("/api/payment/callback", verifyKhaltiPayment);
router.get("/api/admin/payment-history",  checkAuthorization, getAllPayments);

module.exports = router;
