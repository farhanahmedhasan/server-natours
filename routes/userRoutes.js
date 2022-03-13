import express from "express";
import { getAllUsers, createUser, getUser, updateUser, deleteUser } from "../controllers/userController.js";
import { signUp, login, forgotPassword, resetPassword } from "../controllers/authController.js";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);

userRouter.post("/forgot-password", forgotPassword);
userRouter.patch("/reset-password/:token", resetPassword);

userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
