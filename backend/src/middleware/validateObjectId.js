const mongoose = require("mongoose");

function validateObjectId(req, res, next) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid application ID",
    });
  }

  next();
}

module.exports = validateObjectId;
