const express = require("express");
const Business = require("../models/Business");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/business", authMiddleware, async (req, res) => {
  try {
    const doc = await Business.findOne().lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    const { _id, __v, ...rest } = doc;
    return res.json({ success: true, data: rest });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
