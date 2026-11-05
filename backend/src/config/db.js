const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_MONGODB_URI
      : process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MongoDB connection URI is missing");
  }

  await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
