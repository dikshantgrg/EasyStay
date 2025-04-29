const mongoose = require("mongoose");
const { ADMIN, HOST, USER } = require("../Constants/User");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  UserId: {
    type: String,
    unique: true,
    required: true,
  },
  FirstName: {
    type: String,
    required: true,
    trim: true,
  },
  LastName: {
    type: String,
    required: true,
    trim: true,
  },

  Email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: async function (value) {
        console.log({ value });

        let existingUser = await mongoose.models.User.findOne({ Email: value });
        if (existingUser) {
          return false;
        }
        return true;
      },
      message: "Email already exist",
    },
  },

  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: [ADMIN, USER, HOST],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  phoneNumber: {
    type: String,
    required: false,
    trim: true,
  },

  IdVerfication: {
    type: String,
    enum: ["pending", "approved", "rejected"],
  },

  profileImage: {
    type: String, // Will store the URL or path to the image
    required: false,
  },
  govtId: {
    type: {
      type: String,
      enum: ["driverLicense", "passport", "citizenship"],
      required: false,
    },

    front: {
      type: String,
      required: false,
    },
    back: {
      type: String,
      required: false,
    },
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
