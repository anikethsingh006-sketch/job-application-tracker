const express = require("express");
const applicationRoutes = require("./routes/applicationRoutes");

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

// Application routes
app.use("/api/applications", applicationRoutes);

module.exports = app;
