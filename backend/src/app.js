const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Job Application Tracker API is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend connected successfully!",
  });
});

module.exports = app;
