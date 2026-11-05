const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const Application = require("../models/Application");

async function checkIndex() {
  try {
    await mongoose.connect(process.env.TEST_MONGODB_URI);

    await Application.collection.dropIndex("ownerId_1");
    console.log("Dropped redundant ownerId index");

    const indexes = await Application.collection.indexes();
    console.log(indexes);

    const result = await Application.find({
      ownerId: new mongoose.Types.ObjectId("6aec675023b50ea13d3304f5"),
      status: "Applied",
    })
      .sort({ createdAt: -1 })
      .explain("executionStats");

    console.dir(result, { depth: null });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkIndex();
