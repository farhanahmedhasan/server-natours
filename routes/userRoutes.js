import express from "express";
import { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe } from "../controllers/userController.js";
import { protectRoute, signUp, login, forgotPassword, resetPassword, updatePassword } from "../controllers/authController.js";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);

// Reset password via email
userRouter.post("/forgot-password", forgotPassword);
userRouter.patch("/reset-password/:token", resetPassword);

// Update Password When user is logged in
userRouter.patch("/updateMyPassword", protectRoute, updatePassword);

// The user itself (Authenticated user) can UPDATE his name and email
userRouter.patch("/updateMe", protectRoute, updateMe);

// The user itself (Authenticated user) can DELETE his name and email
userRouter.delete("/deleteMe", protectRoute, deleteMe);

userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
