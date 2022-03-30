import Review from "../models/reviewModel.js";
import AppError from "../utils/appError.js";

import { deleteOne, updateOne, createOne, getOne, getAll } from "./factoryController.js";

export const setTourUserIdAndCheckIfUserAlreadyReviewed = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  const tourId = req.body.tour;

  // 1) Get all the reviews for a single tour
  const reviews = await Review.find({ tour: tourId });

  // 2) Check if the user's id already contains on those reviews
  if (!req.body.user) req.body.user = req.user.id;
  const userId = req.body.user;

  const userAllReadyReviewdPost = reviews.find((review) => review.user.id === userId);

  // 3) Send Error if the user already posted a review for a tour
  if (userAllReadyReviewdPost) {
    return next(new AppError("You already posted your review for this Tour", 409));
  }
  next();

  // 4) Create Review on Next middleware
};

export const createReview = createOne(Review);

export const getAllReview = getAll(Review);

export const getReview = getOne(Review);

export const updateReview = updateOne(Review);

export const deleteReview = deleteOne(Review);
