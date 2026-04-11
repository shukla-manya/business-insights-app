const express = require("express");
const Insights = require("../models/Insights");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const doc = await Insights.findOne().lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Insights not found" });
    }
    const { _id, __v, ...rest } = doc;
    return res.json({ success: true, data: rest });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
