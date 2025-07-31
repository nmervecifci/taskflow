const express = require("express");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require("../controllers/projectController");
const { getTasksByProject } = require("../controllers/taskController");
const { authenticated } = require("../middleware/auth");
const { projectOwnerOrAuthorized } = require("../middleware/authorization");

const router = express.Router();

router.use(authenticated);

router.get("/", getProjects);

router.post("/", createProject);

router.get("/:id", getProject);

router.put("/:id", updateProject);

router.delete("/:id", deleteProject);

router.get("/:id/tasks", projectOwnerOrAuthorized, async (req, res) => {
  req.params.projectId = req.params.id;
  return getTasksByProject(req, res);
});

router.post("/:id/tasks", projectOwnerOrAuthorized, async (req, res) => {
  try {
    const { createTask } = require("../controllers/taskController");

    req.body.project = req.params.id;

    req.params.projectId = req.params.id;

    return createTask(req, res);
  } catch (error) {
    console.error("Create task in project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
});

router.post("/:id/members", addProjectMember);

router.delete("/:id/members/:userId", removeProjectMember);

router.get("/:id/stats", projectOwnerOrAuthorized, async (req, res) => {
  try {
    const Project = require("../models/Project");
    const Task = require("../models/Task");

    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const totalTasks = await Task.countDocuments({ project: projectId });
    const pendingTasks = await Task.countDocuments({
      project: projectId,
      status: "pending",
    });
    const inProgressTasks = await Task.countDocuments({
      project: projectId,
      status: "in-progress",
    });
    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: "completed",
    });

    const overdueTasks = await Task.countDocuments({
      project: projectId,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    const highPriorityTasks = await Task.countDocuments({
      project: projectId,
      priority: "high",
    });
    const mediumPriorityTasks = await Task.countDocuments({
      project: projectId,
      priority: "medium",
    });
    const lowPriorityTasks = await Task.countDocuments({
      project: projectId,
      priority: "low",
    });

    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const teamMembersCount = project.members.length;

    const stats = {
      project: {
        id: project._id,
        title: project.title,
        status: project.status,
        priority: project.priority,
        teamMembersCount,
        completionPercentage,
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
      priority: {
        high: highPriorityTasks,
        medium: mediumPriorityTasks,
        low: lowPriorityTasks,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get project stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id/members", projectOwnerOrAuthorized, async (req, res) => {
  try {
    const Project = require("../models/Project");

    const project = await Project.findById(req.params.id)
      .populate("owner", "username name email role avatar")
      .populate("members", "username name email role avatar");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        owner: project.owner,
        members: project.members,
        totalMembers: project.members.length + 1, // +1 for owner
      },
    });
  } catch (error) {
    console.error("Get project members error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
