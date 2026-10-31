const express = require("express");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");

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

//Auth routes
app.use("/api/auth", authRoutes);

module.exports = app;
