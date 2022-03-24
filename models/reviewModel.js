import mongoose from "mongoose";

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

// QUERY Middlewares
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
