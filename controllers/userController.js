import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find();

  return res.status(400).json({
    status: "success ",
    result: users.length,
    data: {
      users,
    },
  });
};

export const createUser = async (req, res) => {
  return res.status(400).json({
    status: "fail ",
    message: `Route Yet not defined`,
  });
};

export const getUser = async (req, res, next) => {
  return res.status(400).json({
    status: "fail ",
    message: `Route Yet not defined`,
  });
};

export const updateUser = async (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

export const deleteUser = async (req, res) => {
  return res.status(400).json({
    status: "fail ",
    message: `Route Yet not defined`,
  });
};
