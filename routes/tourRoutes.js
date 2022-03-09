import express from 'express';

import {
  aliasTopTours,
  getAllTour,
  getTourStats,
  getMonthlyPlan,
  createTour,
  getTour,
  updateTour,
  deleteTour,
} from '../controllers/tourController.js';

const tourRouter = express.Router();

tourRouter.route('/top-5-cheap-cheap').get(aliasTopTours, getAllTour);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

tourRouter.route('/').get(getAllTour).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default tourRouter;
