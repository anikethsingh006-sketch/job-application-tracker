const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const cors = require("cors");

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

// Render terminates HTTPS at its proxy.
// Trust the proxy so Express can recognize secure requests.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Allow the deployed frontend and local Vite frontend.
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(
  Boolean,
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// Application routes
app.use("/api/applications", applicationRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

app.use("/api/analytics", analyticsRoutes);

module.exports = app;
