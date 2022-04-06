import Tour from "../models/tourModel.js";
import AppError from "../utils/appError.js";
// import ApiFeatures from '../utils/apiFeatures.js';

import { deleteOne, updateOne, createOne, getOne, getAll } from "./factoryController.js";

export const aliasTopTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,-ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,ratingsQuantity,duration,difficulty,summary,imageCover";
  next();
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

export const getAllTour = getAll(Tour);

export const getTour = getOne(Tour, { path: "reviews" });

export const createTour = createOne(Tour);

export const updateTour = updateOne(Tour);

export const deleteTour = deleteOne(Tour);

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // {
    //   $match: { ratingsAverage: { $gte: 4.5 } },
    // },
    {
      $group: {
        // _id: null,
        // _id: '$ratingsAverage',
        _id: { $toUpper: "$difficulty" },
        totalTours: { $sum: 1 },
        totalRatings: { $sum: "$ratingsQuantity" },
        avgPrice: { $avg: "$price" },
        avgRating: { $avg: "$ratingsAverage" },
        maxPrice: { $max: "$price" },
        minPrice: { $min: "$price" },
      },
    },

    {
      $sort: { avgPrice: 1 },
    },

    // { $match: { _id: { $eq: 'EASY' } } },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    { $unwind: "$startDates" },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: "$startDates" },
        numToursStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },

    {
      $sort: { numToursStarts: -1 },
    },

    {
      $addFields: { month: "$_id" },
    },

    {
      $project: { _id: 0 },
    },
  ]);

  res.status(200).json({
    status: "success",
    result: plan.length,
    data: {
      plan,
    },
  });

  console.log(year);
});

export const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlong, unit } = req.params;
  // 23.811373, 90.363383 --> [23.811373, 90.363383]
  let [lat, lng] = latlong.split(",");

  // MongoDb expects radians as radius to work
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(new AppError(`Please provide your latitude or longitude in the format : lat,lng`, 400));
  }

  const tours = await Tour.find({
    // Have to give longitude first for mongoose
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  return res.status(200).json({
    status: "Success",
    result: tours.length,
    data: {
      tours,
    },
  });
});
