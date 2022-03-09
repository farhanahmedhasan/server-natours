import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxlength: [16, "Name is too big"],
    minlength: [3, "Name is too small"],
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: [true, "Please provide an email address"],
    validate: [validator.isEmail, "Please enter a valid email"],
  },

  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password should be more than 8 characters"],
    select: false,
  },

  passwordConfirm: {
    type: String,
    validate: {
      // This only works on Create & Save !!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Password doesn't match",
    },
    required: [true, "Please confirm your password"],
  },

  photo: {
    type: String,
    default: "avatar.png",
  },
});

// Encrypting The Password
userSchema.pre("save", async function (next) {
  // Runs only when password created or modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12); // Actual Hassing
  this.passwordConfirm = undefined; // Delete passConfirmField

  next();
});

// Funtion to compare the password
userSchema.methods.correctPassword = async function (candidatePauserPassword, userPassword) {
  return await bcrypt.compare(candidatePauserPassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
