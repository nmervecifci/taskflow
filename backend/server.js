const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/database");
require("dotenv").config();

const app = express();

// Connect to database
connectDB();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));

app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/users", require("./routes/users"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Task Manager API is running",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "PUT /api/auth/profile",
    ],
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedPath: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
