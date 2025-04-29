const express = require("express");
const {
  getAllUsers,

  ProfileImage,
  UserInfo,
  getSingleUser,
  deleteUser,
  getUsersWithPendingIDverfication,
  updateIDverficationStatus,
  changePassword,
  updateGovtId,
} = require("../controller/user");
const { checkAuthorization, isAdmin } = require("../middleware/auth");
const router = express.Router();


router.get("/api/users-info/:id", checkAuthorization, getSingleUser);
router.patch("/api/change-password", checkAuthorization, changePassword)

router.patch("/api/update-govt-ids", checkAuthorization, updateGovtId)
//for admin
router.get("/api/users", checkAuthorization, isAdmin, getAllUsers);
router.get(
  "/users/host-approval",
  checkAuthorization,
  isAdmin,
  getUsersWithPendingIDverfication
);
router.put(
  "/host-approval",
  checkAuthorization,
  isAdmin,
  updateIDverficationStatus
);
router.get("/api/user-info/:id", checkAuthorization, isAdmin, getSingleUser);
router.delete("/api/delete/user/:id", checkAuthorization, isAdmin, deleteUser);

router.put("/api/profile/image", checkAuthorization, ProfileImage);
router.put("/api/update/user", checkAuthorization, UserInfo);

module.exports = router;
