import mongoose from "mongoose";
import Tour from "./tourModel.js";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review must contain your opinions"],
    },

    rating: {
      type: Number,
      min: [1, "Rating can't be less than 1"],
      max: [5, "Rating can't be higher than 5"],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    // Refferencing the parent Data sets
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to insure that a user cannot write 2 reviews on a single tour
// Have Bug Isn't working for now
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Statics Method to calulate avg rating and total reviews of a tour.
// Which can be called directly on the model where instance method can be called on documents
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // On a statics methods this points to the current model where in instance methos this points to the docs

  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nReview: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nReview,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

// DOCUMENT Middleware
// Post middleware doesn't get access to next function
reviewSchema.post("save", function () {
  //this points to the current review after save
  this.constructor.calcAverageRatings(this.tour);
});

// QUERY Middlewares
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// findByIdAndUpdate (behind the scene) === findOneAndUpdate
// findByIdDelete (behind the scene) === findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
