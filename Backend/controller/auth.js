const Joi = require("joi");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Property = require("../model/Property");
const Address = require("../model/Address");
const fs = require("fs");
const path = require("path");

const signUpSchema = Joi.object({
  FirstName: Joi.string().alphanum().min(3).max(30).required(),
  LastName: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(30).required(),
  Email: Joi.string().email().required(),
});

const signup = async (req, res, next) => {
  try {
    const { error } = signUpSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      let errors = error.details.map((el) => {
        return {
          msg: el.message,
          params: el.context.key,
        };
      });
      return res.status(400).send({ errors });
    }
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword);

    const count = await User.countDocuments({});
    const UserId = `U-${count + 1}`;

    let user = await User.create({
      ...req.body,
      UserId,
      password: hashedPassword,
    });
    let userObj = user.toObject();
    delete userObj.password;

    console.log(userObj);
    res.send(userObj);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const loginSchema = Joi.object({
  Email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
});

const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      let errors = error.details.map((el) => {
        return {
          msg: el.message,
          params: el.context.key,
        };
      });
      return res.status(400).send({ errors });
    }
    let user = await User.findOne({ Email: req.body.Email }).select({
      "+password": 1,
    });
    if (!user) {
      return res.status(400).send({ msg: "User not found" });
    }

    let matched = await bcrypt.compare(req.body.password, user.password);
    if (matched) {
      user = user.toObject();
      delete user.password;
      delete user.govtId;

      const tokenPayload = {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        UserId: user.UserId,
        profileImage: user.profileImage,
        role: user.role,
      };
      var token = jwt.sign(tokenPayload, "shhhhh", { expiresIn: "1h" });

      res.send({
        user,
        token,
      });
      console.log(user, token);
    } else {
      res.status(401).send({ msg: "Wrong email or password" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const becomeHost = async (req, res) => {
  const userId = req.user._id;
  const govtIdUploadDir = path.join(__dirname, "../Uploads/govt_ids/");
  const uploadDir = path.join(__dirname, "../Uploads/ProfileImage");
  let uploadedFiles = [];

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a host
    if (user.role === "host") {
      return res.status(400).json({ message: "User is already a host" });
    }

    // Handle phone number: use existing or add from frontend
    if (!user.phoneNumber) {
      if (!req.body.phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      user.phoneNumber = req.body.phoneNumber; // Assign phone number from frontend
    }

    // Validate required files
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Required files are missing" });
    }

    const { govtId_front, govtId_back, profileImage } = req.files;

    let profileImageName = user.profileImage;
    if (profileImage) {
      const profileFileName = `${Date.now()}-${profileImage.name}`;
      const profileFilePath = path.join(uploadDir, profileFileName);
      await profileImage.mv(profileFilePath);
      uploadedFiles.push(profileFilePath);
      profileImageName = profileFileName;
    } else if (!user.profileImage) {
      return res.status(400).json({ message: "Profile image is required" });
    }

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

    // Update user with profile image, government ID, host approval status, and role
    user.profileImage = profileImageName;
    user.IdVerfication = "pending";
    user.govtId = {
      type: req.body.govtId_type,
      front: frontFileName, // Store just the filename
      back: backFileName,
    };
    user.role = "host"; // Change user role to host
    await user.save({ validateBeforeSave: false });

    const userData = user.toObject();

    const tokenPayload = {
      _id: userData._id,
      phoneNumber: userData.phoneNumber,
      FirstName: userData.FirstName,
      LastName: userData.LastName,
      Email: userData.Email,
      UserId: userData.UserId,
      profileImage: userData.profileImage,
      role: userData.role,
    };
    const token = jwt.sign(tokenPayload, "shhhhh", { expiresIn: "1h" });

    return res.status(200).json({
      message: "Successfully applied to become a host",
      token,
    });
  } catch (err) {
    console.error("Error:", err);
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
  signup,
  login,
  becomeHost,
};
