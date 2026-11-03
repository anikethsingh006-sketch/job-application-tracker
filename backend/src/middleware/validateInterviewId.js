const mongoose = require("mongoose");

function validateInterviewId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.interviewId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid interview ID",
    });
  }

  next();
}

module.exports = validateInterviewId;
