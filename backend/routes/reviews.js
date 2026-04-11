const express = require("express");
const Review = require("../models/Review");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

function formatDate(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

router.get("/reviews", authMiddleware, async (req, res) => {
  try {
    const list = await Review.find().sort({ date: -1 }).lean();
    const data = list.map((r) => ({
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      date: formatDate(r.date),
    }));
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
