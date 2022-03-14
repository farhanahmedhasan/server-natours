import crypto from "crypto";

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

  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },

  photo: {
    type: String,
    default: "avatar.png",
  },

  passwordChangedAt: {
    type: Date,
  },

  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
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

// Change passwordChangedAt when we update the password
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1500;
  next();
});

// Funtion to compare the password (Availabale on all documents of this model )
userSchema.methods.correctPassword = async function (candidateUserPassword, userPassword) {
  return await bcrypt.compare(candidateUserPassword, userPassword);
};

// Does the user changed his password after the token has been issued ?
userSchema.methods.changedPasswordAfter = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    const formattedDate = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamps < formattedDate;
  }
  return false;
};

//Generating a random token to reset password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
