const { getAnalytics } = require("../services/analyticsService");
const { redisClient } = require("../config/redis");

async function getAnalyticsController(req, res, next) {
  try {
    const userId = req.session.userId;

    // 1. Create a user-specific cache key
    const cacheKey = `analytics:${userId}`;

    // 2. Check Redis first
    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log("Analytics cache HIT");

        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true,
        });
      }
    } catch (error) {
      console.error("Redis cache read failed:", error.message);
    }

    console.log("Analytics cache MISS");

    // 3. Cache miss: fetch from MongoDB
    const analytics = await getAnalytics(userId);

    // 4. Store the result in Redis for 5 minutes
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(analytics));
    } catch (error) {
      console.error("Redis cache write failed:", error.message);
    }

    return res.status(200).json({
      success: true,
      data: analytics,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAnalyticsController };
