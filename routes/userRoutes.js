import express from "express";
import { getAllUsers, createUser, getUser, updateUser, deleteUser } from "../controllers/userController.js";
import { protectRoute, signUp, login, forgotPassword, resetPassword, updatePassword } from "../controllers/authController.js";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);

// Reset password via email
userRouter.post("/forgot-password", forgotPassword);
userRouter.patch("/reset-password/:token", resetPassword);

// Update Password When user is logged in
userRouter.patch("/updateMyPassword", protectRoute, updatePassword);

userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
