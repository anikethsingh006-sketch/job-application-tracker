const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const Application = require("../models/Application");
const User = require("../models/User");

async function seedApplications() {
  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI);

    // Create a temporary user
    const user = await User.create({
      name: "Index Test User",
      email: "index-test@example.com",
      password: "temporarypassword123",
    });

    const statuses = [
      "Saved",
      "Applied",
      "Online Assessment",
      "Interview",
      "Offer",
    ];

    const applications = Array.from({ length: 100 }, (_, i) => ({
      company: `Company ${i + 1}`,
      role: `Software Engineer ${i + 1}`,
      status: statuses[i % statuses.length],
      ownerId: user._id,
      createdAt: new Date(Date.now() - i * 60000),
      updatedAt: new Date(),
    }));

    await Application.insertMany(applications);

    console.log("Created user:", user._id.toString());
    console.log("Inserted 100 applications");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

seedApplications();
