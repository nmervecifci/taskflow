const express = require("express");

const authController = require("../controllers/authController");
console.log("🔍 AuthController import:", Object.keys(authController));

const { register, login, getCurrentUser, updateProfile, changePassword } =
  authController;

console.log("🔍 Functions check:", {
  register: typeof register,
  login: typeof login,
  getCurrentUser: typeof getCurrentUser,
  updateProfile: typeof updateProfile,
  changePassword: typeof changePassword,
});

const { authenticated } = require("../middleware/auth");
console.log("🔍 Authenticated middleware:", typeof authenticated);

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticated, getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticated, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", authenticated, changePassword);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authenticated, (req, res) => {
  // JWT tokenleri sunucu tarafında invalid edilemez (stateless)
  // Bu endpoint sadece client'a logout başarılı mesajı döner
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Please remove token from client.",
  });
});

module.exports = router;
