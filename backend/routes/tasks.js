const express = require("express");
const {
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
} = require("../controllers/taskController");

const { authenticated } = require("../middleware/auth");
const {
  projectOwnerOrAuthorized,
  taskOwnerOrAuthorized,
  canCreateTask,
  canUpdateTask,
  canDeleteTask,
  canAssignTask,
} = require("../middleware/authorization");

const router = express.Router();

router.use(authenticated);

router.get("/", getTasks);

router.post("/", canCreateTask, createTask);

router.get("/:id", taskOwnerOrAuthorized, getTask);

router.put("/:id", canUpdateTask, updateTask);

router.delete("/:id", canDeleteTask, deleteTask);

router.patch("/:id/status", taskOwnerOrAuthorized, updateTaskStatus);

router.patch("/:id/assign", canAssignTask, assignTask);

router.patch("/:id/progress", taskOwnerOrAuthorized, updateTaskProgress);

router.post("/:id/comments", taskOwnerOrAuthorized, addComment);

router.get("/:id/history", taskOwnerOrAuthorized, getTaskHistory);

router.post("/:id/watchers", taskOwnerOrAuthorized, async (req, res) => {
  try {
    const { userId } = req.body;
    const Task = require("../models/Task");

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.addWatcher(userId);

    res.status(200).json({
      success: true,
      message: "Watcher added successfully",
      data: task,
    });
  } catch (error) {
    console.error("Add watcher error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete(
  "/:id/watchers/:userId",
  taskOwnerOrAuthorized,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const Task = require("../models/Task");

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      await task.removeWatcher(userId);

      res.status(200).json({
        success: true,
        message: "Watcher removed successfully",
        data: task,
      });
    } catch (error) {
      console.error("Remove watcher error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;
