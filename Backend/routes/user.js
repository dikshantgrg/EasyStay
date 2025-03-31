const express = require("express");
const { getAllUsers, getUsersWithPendingHostApproval, updateHostApprovalStatus} = require("../controller/user");
const { checkAuthorization } = require("../middleware/auth");
const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/host-approval", getUsersWithPendingHostApproval);
router.put("/host-approval",updateHostApprovalStatus )



module.exports = router;
