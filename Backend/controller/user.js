const User = require("../model/User");
var jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

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

const ProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if file is uploaded
    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.profileImage;

    // Basic file validation (optional)

    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(__dirname, "../uploads/ProfileImage");
    const destination = path.join(uploadDir, fileName);

    // Ensure upload directory exists

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(uploadDir, user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
    }

    // Move new file
    await file.mv(destination);

    // Update user profile image with validation turned off
    user.profileImage = fileName;
    await user.save({ validateBeforeSave: false }); // Explicitly disable validation

    // Generate a new token with limited data
    const userData = user.toObject();
    delete userData.password; // Ensure password is not included
    const token = jwt.sign(userData, "shhhhh");

    res.status(200).json({
      message: "Profile image updated successfully",
      token,
      profileImage: fileName, // Return the filename for client-side use
    });
  } catch (error) {
    console.error("Profile image update error:", error);
    res.status(500).json({
      message: "Error updating profile image",
      error: error.message,
    });
  }
};

const UserInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { FirstName, LastName, Email, phoneNumber } = req.body;

    const currentUser = await User.findById(userId).select("Email");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const updateData = {};
    if (FirstName) updateData.FirstName = FirstName.trim();
    if (LastName) updateData.LastName = LastName.trim();
    if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();

    if (Email && Email.trim() !== currentUser.Email) {
      const trimmedEmail = Email.trim();
      const existingUser = await User.findOne({ Email: trimmedEmail });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email already used" });
      }
      updateData.Email = trimmedEmail;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = updatedUser.toObject();

    const token = jwt.sign(userData, "shhhhh");

    res.status(200).json({
      message: "User information updated successfully",
      token,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  getUsersWithPendingHostApproval,
  updateHostApprovalStatus,
  ProfileImage,
  UserInfo,
};
