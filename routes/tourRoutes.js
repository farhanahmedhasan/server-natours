import express from "express";

import {
  aliasTopTours,
  getAllTour,
  getTourStats,
  getMonthlyPlan,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} from "../controllers/tourController.js";
import { protectRoute, restrictTo } from "../controllers/authController.js";
import reviewRouter from "./reviewRoutes.js";

const tourRouter = express.Router();

tourRouter.route("/top-5-cheap-tour").get(aliasTopTours, getAllTour);
tourRouter.route("/tour-stats").get(getTourStats);

tourRouter.route("/monthly-plan/:year").get(protectRoute, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

// Only authenticated admin and lead-guide can create a tour
tourRouter.route("/").get(getAllTour).post(protectRoute, restrictTo("admin", "lead-guide"), createTour);

// Only admin and lead-guide can delete and update a tour
tourRouter
  .route("/:id")
  .get(getTour)
  .patch(protectRoute, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protectRoute, restrictTo("admin", "lead-guide"), deleteTour);

// Nested Route for tour --> review
// tour/6asfw87/review if the route match it will use reviewrouter
tourRouter.use("/:tourId/review", reviewRouter);

export default tourRouter;
