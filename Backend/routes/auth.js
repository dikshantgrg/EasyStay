const express = require("express");
const { signup, login, becomeHost, hostStatus } = require("../controller/auth");
const { checkAuthorization, isUser } = require("../middleware/auth");
const router = express.Router();

router.post("/api/signup", signup);
router.post("/api/login", login);
router.post("/api/become-a-host", checkAuthorization, isUser, becomeHost);

module.exports = router;
