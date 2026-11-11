const { redisClient } = require("../config/redis");

// Atomic fixed-window rate limiter.
// INCR and expiry handling happen in one Redis operation.
const rateLimitScript = `
  local current = redis.call("INCR", KEYS[1])

  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  local ttl = redis.call("TTL", KEYS[1])

  -- Defensive handling if a key exists without an expiry.
  if ttl < 0 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
    ttl = tonumber(ARGV[1])
  end

  return { current, ttl }
`;

function createRateLimiter({ windowSeconds, maxRequests, keyPrefix }) {
  return async function rateLimiter(req, res, next) {
    const forwardedFor = req.headers["x-forwarded-for"];

    const clientIp =
      typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : req.ip;

    const key = `rate-limit:${keyPrefix}:${clientIp}`;

    try {
      const [requestCount, ttl] = await redisClient.eval(rateLimitScript, {
        keys: [key],
        arguments: [String(windowSeconds)],
      });

      const remaining = Math.max(0, maxRequests - requestCount);

      res.set("RateLimit-Limit", String(maxRequests));
      res.set("RateLimit-Remaining", String(remaining));
      res.set("RateLimit-Reset", String(ttl));

      if (requestCount > maxRequests) {
        res.set("Retry-After", String(ttl));

        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      // Fail open: allow requests if Redis is unavailable.
      console.error("Rate limiter Redis error:", error.message);
      next();
    }
  };
}

module.exports = createRateLimiter;
