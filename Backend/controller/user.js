const User = require("../model/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const getUsersWithPendingHostApproval = async (req, res) => {
  try {
    const users = await User.find({ hostApprovalStatus: "pending" });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users with pending host approval status",
      error,
    });
  }
};

const updateHostApprovalStatus = async (req, res) => {
  try {
    const { userId, action } = req.body; // action should be "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const update =
      action === "approve"
        ? { role: "host", hostApprovalStatus: "approved" }
        : { hostApprovalStatus: "rejected" };

    const user = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User has been ${
        action === "approve" ? "approved as a host" : "rejected"
      }`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating host approval status",
      error,
    });
  }
};

module.exports = {
  getAllUsers,
  getUsersWithPendingHostApproval,
  updateHostApprovalStatus,
};
