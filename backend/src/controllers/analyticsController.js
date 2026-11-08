const { getAnalytics } = require("../services/analyticsService");

async function getAnalyticsController(req, res, next) {
  try {
    const analytics = await getAnalytics(req.session.userId);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAnalyticsController };
