import User from "../models/userModel.js";
import AppError from "../utils/appError.js";

import { deleteOne, updateOne, getOne, getAll } from "./factoryController.js";

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

export const createUser = async (req, res) => {
  return res.status(400).json({
    status: "fail ",
    message: `Route is not defined . Please use /signup instead`,
  });
};

export const getAllUsers = getAll(User);

export const getUser = getOne(User);

// Do not update the password using this route
export const updateUser = updateOne(User);

export const deleteUser = deleteOne(User);

// The user himself (Authenticated user) can UPDATE his name and email
export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Error if a user tries to do update his password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password update. Please use /updateMyPassword route", 400));
  }

  const datasToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const updatedUser = await User.findByIdAndUpdate(req.user.id, datasToUpdate, {
    new: true,
    runValidators: true,
  });

  // 2) Update the user data
  return res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// The user himself (Authenticated user) can DELETE his name and email
export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  return res.status(204).json({
    status: "Success",
    message: "Your account has been successfully Delete",
    data: null,
  });
});
