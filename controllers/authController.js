import { promisify } from "util";
import crypto from "crypto";

import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/email.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

const setCookie = (token, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id); //Creating the token
  setCookie(token, res); //set token as a cookie

  // Remove password from the output
  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role, passwordChangedAt, photo } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm, role, passwordChangedAt, photo });

  createSendToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // If the email and password exist (if email and pass field is empty)
  if (!email || !password) {
    const err = new AppError("Please provide email or password", 400);
    return next(err);
  }

  // Check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    const error = new AppError("Incorrect Email or Password", 401);
    return next(error);
  }

  createSendToken(user, 200, res);
});

// Protecting Routes.. User needs to be logged in to do (getAllTours,deleteTour)
export const protectRoute = catchAsync(async (req, res, next) => {
  // 1) If token exist on req.header get the token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError(`You are not logged in. Please Login to get access. Pretty Please..!!!`, 401));
  }

  // 2) Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError("The user belonging to the token no longer exists", 401));
  }

  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("The user recently changed their password.. Please login again", 401));
  }

  req.user = freshUser;
  //Grant ACCESS to the protected route
  next();
});

// Giving Permission to types of users
export const restrictTo = (...roles) => {
  // roles --> ['admin','lead-guide']
  return (req, res, next) => {
    // If the user role is not admin or lead-guide
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to do this action", 403));
    }

    next();
  };
};

// Resetting The password functionality via email starts-----
export const forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Please Provide an Email to update your password", 401));
  }

  // 1) Get the user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // 2) Generate Random Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to users email account
  const passwordResetURL = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password ? Submit a patch request with your new password and confirm password to ${passwordResetURL}. \n If you didn't forget Your password please ignore your email`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (Only valid for 10min)`,
      message,
    });

    res.status(200).json({
      status: "success",
      message: `token sent to email`,
    });
  } catch (error) {
    (user.passwordResetToken = undefined), (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });
    return next(`Something wrong with sending the email. Please try again later`, 500);
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const resetToken = req.params.token;
  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await User.findOne({ passwordResetToken: hashedResetToken }).where("passwordResetExpires").gt(Date.now());

  // 2) If te token has not expired and there is a user, Set new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  // 3) Update changedPasswordAt property for the user
  await user.save(); //This will trigger the all pre save middleware in the model

  // 4) Log the user in and send JWT to the client
  createSendToken(user, 200, res);
});

// Updating The password functionality starts (when user logged in) -----
export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the Current User from collection
  const currentUser = await User.findById(req.user.id).select("+password");

  // 2) Check if posted current password is correct
  if (!(await currentUser.correctPassword(req.body.oldPassword, currentUser.password))) {
    return next(new AppError("Your old password is wrong", 401));
  }

  // 3) If so , update password
  currentUser.password = req.body.newPassword;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  await currentUser.save();

  // 4) Log the user in, send JWT
  createSendToken(currentUser, 200, res);
});
