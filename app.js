import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import tourRouter from "./routes/tourRoutes.js";
import userRouter from "./routes/userRoutes.js";

import AppError from "./utils/appError.js";

import globalErrorHandler from "./middlewareFunctions/globalErrorHandler.js";

const app = express();

// GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Prevent DOS and BRUTE FORCE attacks by rate limitting
const limiterFunc = (min, reqNumber, message) => {
  return rateLimit({
    windowMs: min * 60 * 1000, // {min} minutes
    max: reqNumber, // Limit each IP to {number} requests per `window` (here, per {min} minutes)
    message: message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

app.use("/api/v1/tours", limiterFunc(20, 600, "Too many request from this IP..Try again after 20 min"));

app.use("/api/v1/users", limiterFunc(15, 200, "Too many request from this IP. Try again 15 min later"));
app.use("/api/v1/users/login", limiterFunc(5, 20, "Too many logging request from this IP. Try again 5 min later"));
app.use("/api/v1/users/signup", limiterFunc(10, 25, "Too many account creation request from this IP. Try again 10 min later"));

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Handle the routes that are not defined
app.all("*", (req, res, next) => {
  const error = new AppError(`${req.originalUrl} doesn't exist on this server`, 404);
  next(error);
});

//Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;
