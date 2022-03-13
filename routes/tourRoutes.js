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

const tourRouter = express.Router();

tourRouter.route("/top-5-cheap-tour").get(aliasTopTours, getAllTour);
tourRouter.route("/tour-stats").get(getTourStats);
tourRouter.route("/monthly-plan/:year").get(getMonthlyPlan);

tourRouter.route("/").get(protectRoute, getAllTour).post(createTour);

// 1) Only admin and lead-guide can delete a tour
tourRouter.route("/:id").get(getTour).patch(updateTour).delete(protectRoute, restrictTo("admin", "lead-guide"), deleteTour);

export default tourRouter;
