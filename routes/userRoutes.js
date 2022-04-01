import express from "express";
import { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe } from "../controllers/userController.js";
import { protectRoute, signUp, login, forgotPassword, resetPassword, updatePassword, restrictTo } from "../controllers/authController.js";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);

// Reset password via email
userRouter.post("/forgot-password", forgotPassword);
userRouter.patch("/reset-password/:token", resetPassword);

// Protects all the route that comes after this
userRouter.use(protectRoute);

// Update Password When user is logged in
userRouter.patch("/updateMyPassword", updatePassword);

// The user himself (Authenticated user) can UPDATE his name and email
userRouter.patch("/updateMe", updateMe);

// The user himself (Authenticated user) can DELETE his name and email
userRouter.delete("/deleteMe", deleteMe);

// This Route is for > user can see his information
userRouter.route("/me").get(getMe, getUser);

userRouter.use(restrictTo("admin"));
// Only Admin can access these routes

userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
