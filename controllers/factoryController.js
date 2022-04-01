import AppError from "../utils/appError.js";

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

export const deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      const err = new AppError(`document not found with that ID-${id}`, 404);
      return next(err);
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};

export const updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!doc) {
      const err = new AppError(`Tour not found with that ID-${id}`, 404);
      return next(err);
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });
};

export const createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        doc,
      },
    });
  });
};

export const getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query.select("-__v");

    if (!doc) {
      const err = new AppError(`document not found with that ID-${req.params.id}`, 404);
      return next(err);
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });
};

export const getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on Tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    let query = Model.find(filter);

    // BUILD QUERY----------------------------------
    // 1A) Basic Filtering

    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);

    // // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`));

    query.find(queryStr);

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
    const totalDocuments = await Model.countDocuments({});

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Model.estimatedDocumentCount();

      if (skip >= numTours) throw new Error("This page does not exist");
    }

    // EXECUTE QUERY---------------------------------

    const doc = await query;
    // const features = await new ApiFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
    // const doc = await features.query;

    // SEND RESPONSE---------------------------------
    res.status(200).json({
      status: "success",
      results: doc.length,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      requestedAt: req.requestTime,
      data: {
        doc,
      },
    });
  });
};
