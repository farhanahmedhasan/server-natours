import express from "express";

import { getAllReview, createReview } from "../controllers/reviewController.js";
import { protectRoute, restrictTo } from "../controllers/authController.js";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route("/").get(getAllReview).post(protectRoute, restrictTo("user"), createReview);

export default reviewRouter;
