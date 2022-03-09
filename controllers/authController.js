import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import AppError from "../utils/appError.js";

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

export const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });

  const token = signToken(user._id);

  return res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
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

  const token = signToken(user._id);

  return res.status(200).json({
    status: "success",
    token,
  });
});
