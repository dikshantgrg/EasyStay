const express = require("express");
const { getAllUsers, getUsersWithPendingHostApproval, updateHostApprovalStatus, ProfileImage, UserInfo} = require("../controller/user");
const { checkAuthorization } = require("../middleware/auth");
const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/host-approval", getUsersWithPendingHostApproval);
router.put("/host-approval",updateHostApprovalStatus )

router.put("/api/profile/image", checkAuthorization, ProfileImage);
router.put("/api/update/user", checkAuthorization, UserInfo);


module.exports = router;
