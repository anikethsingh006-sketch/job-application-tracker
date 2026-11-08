const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const sessionMongoUri =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

if (!sessionMongoUri) {
  throw new Error("Session MongoDB URI is missing");
}

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

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: sessionMongoUri,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);
// Application routes
app.use("/api/applications", applicationRoutes);
//Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);

module.exports = app;
