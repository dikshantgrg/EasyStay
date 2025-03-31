const express = require("express");
const { signup, login, becomeHost, hostStatus } = require("../controller/auth");
const { checkAuthorization } = require("../middleware/auth");
const router = express.Router();

router.post("/api/signup", signup);
router.post("/api/login", login);
router.post("/api/become-a-host", checkAuthorization, becomeHost);
router.get("/host-status" , checkAuthorization, hostStatus )
module.exports = router;
