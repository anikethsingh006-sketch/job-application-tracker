require("dotenv").config();

const { performance } = require("node:perf_hooks");
const { redisClient } = require("./src/config/redis");

const BASE_URL = "http://localhost:5000";
const COOKIE = process.env.SESSION_COOKIE;
const SAMPLES = 100;

if (!COOKIE) {
  throw new Error("SESSION_COOKIE environment variable is missing");
}

async function request(endpoint) {
  const start = performance.now();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Cookie: COOKIE,
    },
  });

  const body = await response.json();
  const duration = performance.now() - start;

  if (!response.ok) {
    throw new Error(`${endpoint} failed: ${JSON.stringify(body)}`);
  }

  return { body, duration };
}

function getStats(values) {
  const sorted = [...values].sort((a, b) => a - b);

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const median = (sorted[49] + sorted[50]) / 2;
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];

  return { mean, median, p95 };
}

function printStats(label, stats) {
  console.log(`\n${label}`);
  console.log(`Average: ${stats.mean.toFixed(2)} ms`);
  console.log(`Median:  ${stats.median.toFixed(2)} ms`);
  console.log(`P95:     ${stats.p95.toFixed(2)} ms`);
}

async function main() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // 1. Get the authenticated user's ID
    const me = await request("/api/auth/me");
    const userId = me.body.data.id;

    console.log("Authenticated user:", userId);

    const cacheKey = `analytics:${userId}`;

    // 2. Warm up the database and aggregation
    console.log("\nWarming up cache MISS requests...");

    for (let i = 0; i < 5; i++) {
      await redisClient.del(cacheKey);
      const result = await request("/api/analytics");

      if (result.body.cached !== false) {
        throw new Error("Expected cache MISS during warmup");
      }
    }

    // 3. Measure cache MISS
    console.log("\nMeasuring cache MISS...");

    const missTimes = [];

    for (let i = 0; i < SAMPLES; i++) {
      // Clear cache BEFORE starting the timer
      await redisClient.del(cacheKey);

      const result = await request("/api/analytics");

      if (result.body.cached !== false) {
        throw new Error(`Expected MISS at sample ${i + 1}`);
      }

      missTimes.push(result.duration);
    }

    // 4. Warm up cache HIT requests
    console.log("\nWarming up cache HIT requests...");

    for (let i = 0; i < 5; i++) {
      const result = await request("/api/analytics");

      if (result.body.cached !== true) {
        throw new Error("Expected cache HIT during warmup");
      }
    }

    // 5. Measure cache HIT
    console.log("\nMeasuring cache HIT...");

    const hitTimes = [];

    for (let i = 0; i < SAMPLES; i++) {
      const result = await request("/api/analytics");

      if (result.body.cached !== true) {
        throw new Error(`Expected HIT at sample ${i + 1}`);
      }

      hitTimes.push(result.duration);
    }

    // 6. Calculate results
    const missStats = getStats(missTimes);
    const hitStats = getStats(hitTimes);

    console.log("\n========== BENCHMARK RESULTS ==========");

    printStats("CACHE MISS (MongoDB aggregation)", missStats);
    printStats("CACHE HIT (Redis)", hitStats);

    const avgReduction =
      ((missStats.mean - hitStats.mean) / missStats.mean) * 100;

    const medianReduction =
      ((missStats.median - hitStats.median) / missStats.median) * 100;

    console.log("\n========== IMPROVEMENT ==========");
    console.log(`Average response time reduction: ${avgReduction.toFixed(2)}%`);
    console.log(
      `Median response time reduction: ${medianReduction.toFixed(2)}%`,
    );
  } catch (error) {
    console.error("\nBenchmark failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  }
}

main();
