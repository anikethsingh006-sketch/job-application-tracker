const { redisClient, connectRedis } = require("./src/config/redis");

async function testRedis() {
  try {
    await connectRedis();

    // Store a key-value pair
    await redisClient.set("test:key", "Hello Redis!");

    // Retrieve the value
    const value = await redisClient.get("test:key");

    console.log("Retrieved value:", value);

    // Delete the test key
    await redisClient.del("test:key");
  } catch (error) {
    console.error("Redis test failed:", error);
  } finally {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  }
}

testRedis();
