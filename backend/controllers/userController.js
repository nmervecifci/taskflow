const User = require("../models/User");
const Task = require("../models/Task");
const Project = require("../models/Project");

const getUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    let query = {};

    // Apply filters
    if (role && ["Admin", "Manager", "Developer"].includes(role)) {
      query.role = role;
    }

    if (typeof isActive !== "undefined") {
      query.isActive = isActive === "true";
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    console.log(`👥 ${req.user.role} retrieved ${users.length} users`);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If requesting own profile, include additional info
    if (req.user._id.toString() === req.params.id) {
      // Add last login info, preferences, etc.
      const userWithExtras = user.toObject();

      // Get user's recent activity
      const recentTasks = await Task.find({
        $or: [{ assignedTo: user._id }, { createdBy: user._id }],
      })
        .limit(5)
        .sort({ updatedAt: -1 })
        .populate("project", "title")
        .select("title status priority updatedAt");

      const ownedProjects = await Project.find({ owner: user._id })
        .limit(3)
        .sort({ updatedAt: -1 })
        .select("title status priority");

      userWithExtras.recentActivity = {
        tasks: recentTasks,
        projects: ownedProjects,
      };

      return res.status(200).json({
        success: true,
        data: userWithExtras,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { password, ...updateData } = req.body;

    // Check if user can update (admin or own profile)
    if (
      req.user.role !== "Admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    // Non-admin users cannot update role
    if (req.user.role !== "Admin" && updateData.role) {
      delete updateData.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`👤 ${req.user.role} updated user: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Check if user has active projects or tasks
    const ownedProjects = await Project.countDocuments({
      owner: req.params.id,
    });
    const assignedTasks = await Task.countDocuments({
      assignedTo: req.params.id,
      status: { $ne: "completed" },
    });

    if (ownedProjects > 0 || assignedTasks > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete user with active projects or tasks. Please reassign them first.",
        details: {
          ownedProjects,
          assignedTasks,
        },
      });
    }

    await User.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Admin ${req.user.username} deleted user: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["Admin", "Manager", "Developer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be: Admin, Manager, or Developer",
      });
    }

    // Prevent changing own role
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      `🔄 Admin ${req.user.username} changed ${user.username} role to: ${role}`
    );

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId).select("username name role");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get task statistics
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "pending",
    });
    const inProgressTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "in-progress",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "completed",
    });

    // Get created tasks
    const createdTasks = await Task.countDocuments({ createdBy: userId });

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    // Get project statistics
    const ownedProjects = await Project.countDocuments({ owner: userId });
    const memberProjects = await Project.countDocuments({ members: userId });

    // Get task completion rate
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get average task completion time (for completed tasks)
    const completedTasksWithDates = await Task.find({
      assignedTo: userId,
      status: "completed",
      completedAt: { $exists: true },
      createdAt: { $exists: true },
    }).select("createdAt completedAt");

    let avgCompletionTime = 0;
    if (completedTasksWithDates.length > 0) {
      const totalTime = completedTasksWithDates.reduce((sum, task) => {
        const timeDiff = task.completedAt.getTime() - task.createdAt.getTime();
        return sum + timeDiff;
      }, 0);
      avgCompletionTime = Math.round(
        totalTime / completedTasksWithDates.length / (1000 * 60 * 60 * 24)
      ); // in days
    }

    // Get monthly task completion trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCompletions = await Task.aggregate([
      {
        $match: {
          assignedTo: require("mongoose").Types.ObjectId(userId),
          status: "completed",
          completedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$completedAt" },
            month: { $month: "$completedAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const stats = {
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        created: createdTasks,
        overdue: overdueTasks,
        completionRate,
        avgCompletionDays: avgCompletionTime,
      },
      projects: {
        owned: ownedProjects,
        member: memberProjects,
        total: ownedProjects + memberProjects,
      },
      trend: {
        monthlyCompletions,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getUserDashboard = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check authorization (own dashboard or Admin/Manager)
    if (
      req.user._id.toString() !== userId &&
      !["Admin", "Manager"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this dashboard",
      });
    }

    // Get user info
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get urgent tasks (due soon and overdue)
    const urgentTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: "completed" },
      $or: [
        { dueDate: { $lt: new Date() } }, // Overdue
        {
          dueDate: {
            $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
          },
        },
      ],
    })
      .populate("project", "title")
      .sort({ dueDate: 1 })
      .limit(5);

    // Get recent projects
    const recentProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title status priority updatedAt");

    // Get task summary
    const taskSummary = await Task.aggregate([
      { $match: { assignedTo: require("mongoose").Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const dashboardData = {
      user,
      urgentTasks,
      recentProjects,
      taskSummary: taskSummary.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get user dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
  getUserDashboard,
};
