import express from "express";

import { getAllReview, createReview, deleteReview } from "../controllers/reviewController.js";
import { protectRoute, restrictTo } from "../controllers/authController.js";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route("/").get(getAllReview).post(protectRoute, restrictTo("user"), createReview);

reviewRouter.route("/:id").delete(deleteReview);

export default reviewRouter;
