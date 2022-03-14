import AppError from "../utils/appError.js";

// Types of Error mongoose
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const myValues = Object.values(err.keyValue);
  const message = `Duplicate field value: ${myValues} already exist`;
  return new AppError(message, 409);
};

const handleValidationErrorsDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// JWT Errors
const handleJWTError = () => new AppError(`Invalid token. Please login again. Pretty Please!!!`, 401);

const handleJWTExpireError = () => new AppError(`Your login session has been expired. Please login again. Pretty Please!!!`, 401);

// Error on production or dev
const sendErrorDev = (err, res) => {
  console.log(err);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, Trusted Errors: Send Message To Client

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: Don't leak to the client
  } else {
    console.log("💥 Error", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }

  let error = { ...err };
  if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") error = handleCastErrorDB(error);

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    if (err.name === "ValidationError") error = handleValidationErrorsDB(error);

    // JWT realated Errors
    if (err.name === "JsonWebTokenError") error = handleJWTError();

    if (err.name === "TokenExpiredError") error = handleJWTExpireError();

    sendErrorProd(error, res);
  }
};
