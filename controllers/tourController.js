import Tour from "../models/tourModel.js";

import AppError from "../utils/appError.js";
// import ApiFeatures from '../utils/apiFeatures.js';

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

export const getAllTour = catchAsync(async (req, res, next) => {
  // BUILD QUERY----------------------------------
  // 1A) Basic Filtering
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];

  excludedFields.forEach((el) => delete queryObj[el]);

  // // 1B) Advanced Filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`));

  let query = Tour.find(queryStr);

  // 2) SORTING
  if (req.query.sort) {
    const sort = req.query.sort;

    const sortBy = sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // 3) LIMITING FIELDS -- Select fields knows as query projection
  if (req.query.fields) {
    const fields = req.query.fields.split(",");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // 4) PAGINAITON
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 6;
  const skip = (page - 1) * limit;
  const totalDocuments = await Tour.countDocuments({});

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numTours = await Tour.estimatedDocumentCount();

    if (skip >= numTours) throw new Error("This page does not exist");
  }

  // EXECUTE QUERY---------------------------------

  const tours = await query;
  // const features = await new ApiFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
  // const tours = await features.query;

  // SEND RESPONSE---------------------------------
  res.status(200).json({
    status: "success",
    results: tours.length,
    totalDocuments,
    totalPages: Math.ceil(totalDocuments / limit),
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id);

  if (!tour) {
    const err = new AppError(`Tour not found with that ID-${id}`, 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

export const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      newTour,
    },
  });
});

export const updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!updatedTour) {
    const err = new AppError(`Tour not found with that ID-${id}`, 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedTour,
    },
  });
});

export const deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    const err = new AppError(`Tour not found with that ID-${id}`, 404);
    return next(err);
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

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
