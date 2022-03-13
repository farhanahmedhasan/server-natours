import express from "express";
import morgan from "morgan";

import tourRouter from "./routes/tourRoutes.js";
import userRouter from "./routes/userRoutes.js";

import AppError from "./utils/appError.js";

import globalErrorHandler from "./middlewareFunctions/globalErrorHandler.js";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

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
