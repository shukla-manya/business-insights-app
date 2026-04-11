const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, required: true },
  },
  // Named separately from "reviews" so seeding works if the DB already has another app's reviews collection (e.g. unique index on product+user).
  { collection: "bi_reviews" }
);

module.exports = mongoose.model("Review", reviewSchema);
