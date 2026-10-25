const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const mongoose = require("mongoose");
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  const testUri = process.env.TEST_MONGODB_URI;

  if (!testUri) {
    throw new Error("TEST_MONGODB_URI is missing");
  }

  if (!testUri.includes("job_application_tracker_test")) {
    throw new Error("Refusing to run tests against a non-test database");
  }

  await mongoose.connect(testUri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
