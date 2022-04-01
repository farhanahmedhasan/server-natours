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

// Protect all the route after this
reviewRouter.use(protectRoute);

reviewRouter.route("/").get(getAllReview).post(restrictTo("user"), setTourUserIdAndCheckIfUserAlreadyReviewed, createReview);

reviewRouter
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

export default reviewRouter;
