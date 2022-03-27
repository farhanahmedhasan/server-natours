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
