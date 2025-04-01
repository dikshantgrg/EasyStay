const express = require("express");
const { verifyKhaltiPayment } = require("../controller/paymentController");
const router = express.Router();

router.get("/api/payment/callback", verifyKhaltiPayment);


module.exports = router;
