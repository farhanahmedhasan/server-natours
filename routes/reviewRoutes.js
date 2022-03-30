import express from "express";

import {
  getAllReview,
  getReview,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIdAndCheckIfUserAlreadyReviewed,
} from "../controllers/reviewController.js";
import { protectRoute, restrictTo } from "../controllers/authController.js";

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route("/").get(getAllReview).post(protectRoute, restrictTo("user"), setTourUserIdAndCheckIfUserAlreadyReviewed, createReview);

reviewRouter.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);

export default reviewRouter;
