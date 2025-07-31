const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/database");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();

// Connect to database
connectDB();

// 🔁 CORS Ayarı: En başta olmalı!
const allowedOrigins = [
  "http://localhost:3000",
  "https://taskflow-4.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman, mobile apps vs. için origin check'i bypass et
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ CORS blocked origin:", origin);
        return callback(new Error("CORS hatası: Yetkisiz origin -> " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`🌍 Origin: ${req.headers.origin}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API root is working" });
});

// Health check
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

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/users", require("./routes/users"));

// Error handling
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.originalUrl);
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedPath: req.originalUrl,
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Allowed origins:`, allowedOrigins);
});
