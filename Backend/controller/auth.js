const Joi = require("joi");
const User = require("../model/User");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const Property = require("../model/Property");
const Address = require("../model/Address");
const fs = require("fs");
const path = require("path");
const { ADMIN, HOST, USER } = require("../Constants/User");

const signUpSchema = Joi.object({
  FirstName: Joi.string().alphanum().min(3).max(30).required(),
  LastName: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().alphanum().min(8).max(30).required(),
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

    let user = await User.create({ ...req.body, password: hashedPassword });
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
  password: Joi.string().alphanum().min(8).max(30).required(),
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
      // delete user.password;
      var token = jwt.sign(user, "shhhhh");
      
      res.send({
        user,
        token,
      });
      console.log(user,token);
    } else {
      res.status(401).send({ msg: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};


const becomeHost = async (req, res) => {
  const userId = req.user._id;
  const govtIdUploadDir = path.join(__dirname, "../uploads/govt_ids/"); // Directory for govt IDs
  const propertyUploadDir = path.join(__dirname, "../uploads/properties/"); // Directory for property images
  let uploadedFiles = []; // Track uploaded files for cleanup

  try {
    // Ensure upload directories exist
    [govtIdUploadDir, propertyUploadDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a host
    if (user.role === HOST) {
      return res.status(400).json({ message: "User is already a host" });
    }

    // Validate required files
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Required files are missing" });
    }

    const { govtId_front, govtId_back, images } = req.files;

    // Validate government ID
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

    // Update user with government ID and host approval status
    user.hostApprovalStatus = "pending";
    user.govtId = {
      type: req.body.govtId_type,
      front: frontFileName, // Store just the filename
      back: backFileName,
    };
    await user.save({ validateBeforeSave: false });

    // Validate property images
    if (!images) {
      return res
        .status(400)
        .json({ message: "No property images were uploaded" });
    }

    const imageFiles = Array.isArray(images) ? images : [images];
    if (imageFiles.length < 5) {
      return res
        .status(400)
        .json({ message: "You must upload at least 5 images" });
    }

    // Upload property images
    const imagePaths = [];
    for (const file of imageFiles) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(propertyUploadDir, fileName);
      await file.mv(filePath);
      imagePaths.push(fileName);
      uploadedFiles.push(filePath);
    }

    // Save address
    const { street, city, province_id, zipCode } = req.body;
    const address = new Address({ street, city, province_id, zipCode });
    const savedAddress = await address.save();

    // Create property
    const newProperty = new Property({
      hostId: userId,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      maxGuest: req.body.maxGuest,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      kitchen: req.body.kitchen,
      images: imagePaths, // Store just filenames
      longitude: req.body.longitude,
      latitude: req.body.latitude,
      addressId: savedAddress._id,
    });

    const property = await newProperty.save();
    return res
      .status(201)
      .json({ message: "Property created successfully", property });
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


const hostStatus = async (req,res) => {
  try {
    const user = await User.findById(req.user._id).select('hostApprovalStatus role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare user data for token (convert Mongoose doc to plain object)
    const userData = {
      id: user._id.toString(), // Ensure ID is a string
      role: user.role,
    };

  
    var token = jwt.sign(userData, "shhhhh");

    res.status(200).send({
      user: {
        hostApprovalStatus: user.hostApprovalStatus || 'pending',
        role: user.role,
      },
      token, // Send new token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status', error });
  }
};

module.exports = {
  signup,
  login,
  becomeHost,
  hostStatus
};
