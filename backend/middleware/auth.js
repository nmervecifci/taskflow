const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticated = async (req, res, next) => {
  try {
    let token;

    // Bearer Token varsa al
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Cookie'den token alma (eğer Bearer yoksa)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Token is valid but user not found" });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error during authentication" });
  }
};

// Role-based middleware functions
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
};

const managerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "Admin" || req.user.role === "Manager")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Manager or Admin role required.",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = {
  authenticated,
  adminOnly,
  managerOrAdmin,
  authorize,
};
