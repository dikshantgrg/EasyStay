const User = require("../model/User");
var jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Start with an empty query object
    let query = {};

    // Add condition to exclude admins
    query.role = { $ne: "admin" };

    // Handle search
    if (search && search.trim() !== "") {
      query.$or = [
        { FirstName: { $regex: new RegExp(search, "i") } },
        { LastName: { $regex: new RegExp(search, "i") } },
        { Email: { $regex: new RegExp(search, "i") } },
        { UserId: { $regex: new RegExp(search, "i") } }, // Added userId search
      ];
    }

    // Handle role filter
    if (role && ["user", "host"].includes(role)) {
      query.role = role; // This will override the $ne: "admin" condition
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ role: 1 })
        .lean(), // Add .lean() for better performance
      User.countDocuments(query),
    ]);

    res.status(200).json({
      users,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const getUsersWithPendingIDverfication = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Start with the base query for pending verification
    let query = { IdVerfication: "pending" };

    // Handle search
    if (search && search.trim() !== "") {
      query.$and = [
        { IdVerfication: "pending" },
        {
          $or: [
            { FirstName: { $regex: new RegExp(search, "i") } },
            { LastName: { $regex: new RegExp(search, "i") } },
            { Email: { $regex: new RegExp(search, "i") } },
            { UserId: { $regex: new RegExp(search, "i") } },
          ],
        },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      users,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching users with pending ID verification:", error);
    res.status(500).json({
      message: "Error fetching users with pending ID verification",
      error: error.message,
    });
  }
};

const updateIDverficationStatus = async (req, res) => {
  try {
    const { userId, action } = req.body; // action should be "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const update =
      action === "approve"
        ? { IdVerfication: "approved" }
        : { role: "user", IdVerfication: "rejected" };

    const user = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User has been ${
        action === "approve" ? "Id verfied" : "rejected"
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
    const tokenPayload = {
      _id: userData._id,
      phoneNumber: userData.phoneNumber,
      FirstName: userData.FirstName,
      LastName: userData.LastName,
      Email: userData.Email,
      UserId: userData.userDataId,
      profileImage: userData.profileImage,
      role: userData.role,
    };
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

    // Create payload with specific fields and add expiration
    const tokenPayload = {
      _id: updatedUser._id,
      phoneNumber: updatedUser.phoneNumber,
      FirstName: updatedUser.FirstName,
      LastName: updatedUser.LastName,
      Email: updatedUser.Email,
      UserId: updatedUser.UserId,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
    };

    const token = jwt.sign(tokenPayload, "shhhhh", { expiresIn: "1h" });

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

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      _id: user._id,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profileImage: user.profileImage,
      IdVerfication: user.IdVerfication,
      createdAt: user.createdAt,
      govtId: user.govtId,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "failed" });
  }
};

const passwordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(50).required(),
});

const changePassword = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = passwordSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { currentPassword, newPassword } = value;
    const userId = req.user._id;

    // Find user with password field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateGovtId = async (req, res) => {
  const userId = req.user._id;
  const govtIdUploadDir = path.join(__dirname, "../uploads/govt_ids/"); // Directory for govt IDs
  let uploadedFiles = [];

  try {
    if (!fs.existsSync(govtIdUploadDir)) {
      fs.mkdirSync(govtIdUploadDir, { recursive: true });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store previous government ID file paths for deletion
    const previousGovtId = {
      front: user.govtId?.front
        ? path.join(govtIdUploadDir, user.govtId.front)
        : null,
      back: user.govtId?.back
        ? path.join(govtIdUploadDir, user.govtId.back)
        : null,
    };

    // Validate required files
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Required files are missing" });
    }

    const { govtId_front, govtId_back } = req.files;
    const { govtId_type } = req.body;

    // Validate government ID front image
    if (!govtId_front) {
      return res
        .status(400)
        .json({ message: "Government ID front image is required" });
    }

    // Upload government ID front image
    const frontFileName = `${Date.now()}-${govtId_front.name}`;
    const frontFilePath = path.join(govtIdUploadDir, frontFileName);
    await govtId_front.mv(frontFilePath);
    uploadedFiles.push(frontFilePath);

    // Upload government ID back image (if provided)
    let backFileName = null;
    if (govtId_back) {
      backFileName = `${Date.now()}-${govtId_back.name}`;
      const backFilePath = path.join(govtIdUploadDir, backFileName);
      await govtId_back.mv(backFilePath);
      uploadedFiles.push(backFilePath);
    }

    // Update user with new government ID and verification status
    user.govtId = {
      type: govtId_type,
      front: frontFileName, // Store just the filename
      back: backFileName,
    };
    user.IdVerfication = "pending";

    // Save updated user
    await user.save({ validateBeforeSave: false });

    // Delete previous government ID images if they exist
    if (previousGovtId.front && fs.existsSync(previousGovtId.front)) {
      try {
        fs.unlinkSync(previousGovtId.front);
      } catch (err) {
        console.error("Error deleting previous front ID image:", err);
      }
    }
    if (previousGovtId.back && fs.existsSync(previousGovtId.back)) {
      try {
        fs.unlinkSync(previousGovtId.back);
      } catch (err) {
        console.error("Error deleting previous back ID image:", err);
      }
    }

    return res.status(200).json({
      message: "Government ID updated successfully. Verification pending.",
      user: {
        UserId: user.UserId,
        IdVerfication: user.IdVerfication,
        govtId: user.govtId,
      },
    });
  } catch (err) {
    console.error("Error updating government ID:", err);
    // Cleanup uploaded files on error
    uploadedFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUsersWithPendingIDverfication,
  updateIDverficationStatus,
  ProfileImage,
  UserInfo,
  getSingleUser,
  deleteUser,
  changePassword,
  updateGovtId,
};
