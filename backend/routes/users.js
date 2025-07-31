const express = require("express");
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
} = require("../controllers/userController");
const {
  authenticated,
  adminOnly,
  managerOrAdmin,
  authorize,
} = require("../middleware/auth");

const router = express.Router();

router.use(authenticated);

router.get("/simple", async (req, res) => {
  try {
    const User = require("../models/User");

    let query = { isActive: true }; // Sadece aktif kullanıcıları getir

    // Developers only see other developers and managers
    if (req.user.role === "Developer") {
      query.role = { $in: ["Developer", "Manager"] };
    }

    const users = await User.find(query, "name username email role").sort({
      name: 1,
    });

    console.log(
      `📋 ${req.user.role} requested user list: ${users.length} users returned`
    );

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get simple users error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/", managerOrAdmin, getUsers);

router.get(
  "/:id",
  async (req, res, next) => {
    // Users can access their own profile
    if (req.params.id === req.user._id.toString()) {
      return next();
    }

    // Or Admin/Manager can access any profile
    return managerOrAdmin(req, res, next);
  },
  getUser
);

router.put(
  "/:id",
  async (req, res, next) => {
    // Users can update their own profile (except role)
    if (req.params.id === req.user._id.toString()) {
      // Remove role from update data if not admin
      if (req.user.role !== "Admin" && req.body.role) {
        delete req.body.role;
        console.log(`🚫 Non-admin user ${req.user.email} tried to update role`);
      }
      return next();
    }

    // Only Admin can update other users
    return adminOnly(req, res, next);
  },
  updateUser
);

router.delete("/:id", adminOnly, deleteUser);

router.patch("/:id/role", adminOnly, updateUserRole);

router.patch("/:id/status", adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const User = require("../models/User");

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive field must be boolean",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      `👤 Admin ${req.user.email} ${
        isActive ? "activated" : "deactivated"
      } user: ${user.email}`
    );

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get(
  "/:id/stats",
  async (req, res, next) => {
    // Users can access their own stats
    if (req.params.id === req.user._id.toString()) {
      return next();
    }

    // Or Admin/Manager can access any stats
    return managerOrAdmin(req, res, next);
  },
  getUserStats
);

module.exports = router;
