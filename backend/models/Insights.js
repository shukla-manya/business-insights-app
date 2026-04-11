const mongoose = require("mongoose");

const insightsSchema = new mongoose.Schema(
  {
    profile_views: { type: Number, required: true },
    search_views: { type: Number, required: true },
    website_clicks: { type: Number, required: true },
    phone_calls: { type: Number, required: true },
    direction_requests: { type: Number, required: true },
  },
  { collection: "insights" }
);

module.exports = mongoose.model("Insights", insightsSchema);
