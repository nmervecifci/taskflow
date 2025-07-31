const Task = require("../models/Task");
const Project = require("../models/Project");
const TaskLog = require("../models/TaskLog");

const getTasks = async (req, res) => {
  try {
    let query = {};
    const { status, priority, project, assignedTo } = req.query;

    // Role-based filtering
    if (req.user.role === "Developer") {
      query = {
        $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
      };
    } else if (req.user.role === "Manager") {
      // Manager can see tasks from projects they own or are members of
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select("_id");

      const projectIds = userProjects.map((p) => p._id);
      query.project = { $in: projectIds };
    }
    // Admin can see all tasks (no additional filtering)

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate("project", "title")
      .populate("assignedTo", "username name email")
      .populate("createdBy", "username name email")
      .sort({ createdAt: -1 });

    console.log(`📋 ${req.user.role} retrieved ${tasks.length} tasks`);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      userRole: req.user.role,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "title owner members")
      .populate("assignedTo", "username name email role")
      .populate("createdBy", "username name email role")
      .populate("comments.user", "username name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Authorization check
    const canView =
      req.user.role === "Admin" ||
      task.createdBy._id.toString() === req.user._id.toString() ||
      (task.assignedTo &&
        task.assignedTo._id.toString() === req.user._id.toString()) ||
      task.project.owner.toString() === req.user._id.toString() ||
      task.project.members.includes(req.user._id);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this task",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      status,
      dueDate,
      estimatedHours,
    } = req.body;

    // Validation
    if (!title || !description || !project) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and project are required",
      });
    }

    // Check if project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization check for task creation
    const canCreate =
      req.user.role === "Admin" ||
      req.user.role === "Manager" ||
      projectDoc.owner.toString() === req.user._id.toString() ||
      projectDoc.members.includes(req.user._id);

    if (!canCreate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create tasks in this project",
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || "medium",
      status: status || "pending",
      dueDate,
      estimatedHours,
    });

    // Create log entry
    await TaskLog.createLog(task._id, "created", req.user._id, {
      description: `Task "${title}" created with status ${status || "pending"}`,
    });

    await task.populate("project", "title");
    await task.populate("assignedTo", "username name email");
    await task.populate("createdBy", "username name email");

    console.log(
      `✨ ${req.user.role} created task: ${task.title} in project: ${task.project.title}`
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);

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

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Store old values for logging
    const oldValues = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
    };

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("project", "title")
      .populate("assignedTo", "username name email")
      .populate("createdBy", "username name email");

    // Create log entry for changes
    const changes = [];
    Object.keys(req.body).forEach((key) => {
      if (oldValues[key] !== undefined && oldValues[key] !== req.body[key]) {
        changes.push(`${key}: ${oldValues[key]} → ${req.body[key]}`);
      }
    });

    if (changes.length > 0) {
      await TaskLog.createLog(task._id, "updated", req.user._id, {
        description: `Task updated: ${changes.join(", ")}`,
      });
    }

    console.log(`📝 ${req.user.role} updated task: ${updatedTask.title}`);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user can delete (creator, project owner, admin, manager)
    const canDelete =
      req.user.role === "Admin" ||
      req.user.role === "Manager" ||
      task.createdBy.toString() === req.user._id.toString() ||
      task.project.owner.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    // Delete related logs
    await TaskLog.deleteMany({ task: req.params.id });

    await Task.findByIdAndDelete(req.params.id);

    console.log(`🗑️ ${req.user.role} deleted task: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Validate status
    const validStatuses = ["pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, in-progress, or completed",
      });
    }

    const oldStatus = task.status;

    // Update completion date if status changes to completed
    if (status === "completed" && oldStatus !== "completed") {
      task.completedAt = new Date();
    } else if (status !== "completed") {
      task.completedAt = undefined;
    }

    task.status = status;
    await task.save();

    // Create log entry
    await TaskLog.createLog(task._id, "status_changed", req.user._id, {
      field: "status",
      oldValue: oldStatus,
      newValue: status,
      description: `Status changed from ${oldStatus} to ${status}`,
    });

    await task.populate("project", "title");
    await task.populate("assignedTo", "username name email");

    console.log(
      `🔄 ${req.user.role} changed task status: ${task.title} (${oldStatus} → ${status})`
    );

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Validate user exists if userId provided
    if (userId) {
      const User = require("../models/User");
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    const oldAssignee = task.assignedTo;
    task.assignedTo = userId || null;
    await task.save();

    // Create log entry
    const logDescription = userId ? "Task assigned to user" : "Task unassigned";

    await TaskLog.createLog(task._id, "assigned", req.user._id, {
      field: "assignedTo",
      oldValue: oldAssignee,
      newValue: userId,
      description: logDescription,
    });

    await task.populate("assignedTo", "username name email");

    console.log(
      `👤 ${req.user.role} ${userId ? "assigned" : "unassigned"} task: ${
        task.title
      }`
    );

    res.status(200).json({
      success: true,
      message: userId
        ? "Task assigned successfully"
        : "Task unassigned successfully",
      data: task,
    });
  } catch (error) {
    console.error("Assign task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo } = req.query;

    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization check
    const canView =
      req.user.role === "Admin" ||
      project.owner.toString() === req.user._id.toString() ||
      project.members.includes(req.user._id);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view tasks in this project",
      });
    }

    let query = { project: projectId };

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate("assignedTo", "username name email")
      .populate("createdBy", "username name email")
      .sort({ createdAt: -1 });

    console.log(
      `📋 ${req.user.role} retrieved ${tasks.length} tasks from project: ${project.title}`
    );

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      project: {
        id: project._id,
        title: project.title,
      },
    });
  } catch (error) {
    console.error("Get tasks by project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.comments.push({
      user: req.user._id,
      content: content.trim(),
    });

    await task.save();
    await task.populate("comments.user", "username name email");

    // Create log entry
    await TaskLog.createLog(task._id, "comment_added", req.user._id, {
      description: `Comment added: ${content.substring(0, 50)}${
        content.length > 50 ? "..." : ""
      }`,
    });

    console.log(`💬 ${req.user.role} added comment to task: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: task,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTaskHistory = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const history = await TaskLog.getTaskHistory(req.params.id);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Get task history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateTaskProgress = async (req, res) => {
  try {
    const { actualHours } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (actualHours < 0) {
      return res.status(400).json({
        success: false,
        message: "Actual hours cannot be negative",
      });
    }

    const oldHours = task.actualHours;
    task.actualHours = actualHours;
    await task.save();

    // Create log entry
    await TaskLog.createLog(task._id, "updated", req.user._id, {
      field: "actualHours",
      oldValue: oldHours,
      newValue: actualHours,
      description: `Actual hours updated: ${oldHours} → ${actualHours}`,
    });

    console.log(
      `⏱️ ${req.user.role} updated task progress: ${task.title} (${actualHours}h)`
    );

    res.status(200).json({
      success: true,
      message: "Task progress updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("Update task progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  getTasksByProject,
  addComment,
  getTaskHistory,
  updateTaskProgress,
};
