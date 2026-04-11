const mongoose = require("mongoose");
const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    rating: { type: Number, required: true },
    total_reviews: { type: Number, required: true },
  },
  { collection: "business" }
);

module.exports = mongoose.model("Business", businessSchema);
