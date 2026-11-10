const { redisClient } = require("../config/redis");

async function invalidateAnalyticsCache(userId) {
  try {
    const cacheKey = `analytics:${userId}`;

    await redisClient.del(cacheKey);

    console.log("Analytics cache invalidated");
  } catch (error) {
    console.error("Cache invalidation failed:", error.message);
  }
}

module.exports = {
  invalidateAnalyticsCache,
};
