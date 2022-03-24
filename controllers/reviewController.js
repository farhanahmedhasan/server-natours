import mongoose from "mongoose";

import Review from "../models/reviewModel.js";
import AppError from "../utils/appError.js";

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

export const createReview = catchAsync(async (req, res, next) => {
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

  // 4) Create Review

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

export const getAllReview = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter).select("-__v");

  res.status(200).json({
    status: "success",
    result: reviews.length,
    data: {
      reviews,
    },
  });
});
