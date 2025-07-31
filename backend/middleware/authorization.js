const Task = require("../models/Task");
const Project = require("../models/Project");

const projectOwnerOrAuthorized = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı" });
    }

    const userId = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.includes(req.user._id);

    if (isOwner || isMember || req.user.role === "Admin") {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: "Bu proje için yetkiniz yok" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Yetki kontrolü sırasında hata oluştu",
    });
  }
};

const taskOwnerOrAuthorized = async (req, res, next) => {
  try {
    const taskId = req.params.id || req.params.taskId;
    const task = await Task.findById(taskId).populate("project");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Görev bulunamadı" });
    }

    const userId = req.user._id.toString();
    const isCreator = task.createdBy.toString() === userId;
    const isAssigned = task.assignedTo?.toString() === userId;
    const isProjectOwner = task.project.owner.toString() === userId;
    const isProjectMember = task.project.members.includes(req.user._id);

    if (
      isCreator ||
      isAssigned ||
      isProjectOwner ||
      isProjectMember ||
      req.user.role === "Admin"
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: "Bu görev için yetkiniz yok" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Görev yetki kontrolü sırasında hata oluştu",
    });
  }
};

const canCreateTask = async (req, res, next) => {
  try {
    const projectId = req.body.project;
    if (!projectId) {
      return res
        .status(400)
        .json({ success: false, message: "Proje ID gerekli" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Proje bulunamadı" });
    }

    if (req.user.role === "Admin" || req.user.role === "Manager") {
      return next();
    }

    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      project.members.includes(req.user._id);

    if (hasAccess) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Bu projede görev oluşturma yetkiniz yok",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Yetki kontrolü sırasında hata oluştu",
    });
  }
};

const canUpdateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Görev bulunamadı" });
    }

    if (req.user.role === "Admin" || req.user.role === "Manager") {
      return next();
    }

    if (task.createdBy.toString() === req.user._id.toString()) {
      return next();
    }

    if (task.project.owner.toString() === req.user._id.toString()) {
      return next();
    }

    if (task.assignedTo?.toString() === req.user._id.toString()) {
      const allowedFields = ["status", "actualHours"];
      const updateFields = Object.keys(req.body);
      const isAllowedUpdate = updateFields.every((field) =>
        allowedFields.includes(field)
      );
      if (isAllowedUpdate) {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Atanan kullanıcı sadece durum ve çalışma saati güncelleyebilir",
        });
      }
    }

    return res
      .status(403)
      .json({ success: false, message: "Bu görevi güncelleme yetkiniz yok" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Yetki kontrolü sırasında hata oluştu",
    });
  }
};

const canDeleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Görev bulunamadı" });
    }

    if (req.user.role === "Admin" || req.user.role === "Manager") {
      return next();
    }

    if (task.createdBy.toString() === req.user._id.toString()) {
      return next();
    }

    if (task.project.owner.toString() === req.user._id.toString()) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: "Bu görevi silme yetkiniz yok" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Yetki kontrolü sırasında hata oluştu",
    });
  }
};

const canAssignTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Görev bulunamadı" });
    }

    if (req.user.role === "Admin" || req.user.role === "Manager") {
      return next();
    }

    if (task.project.owner.toString() === req.user._id.toString()) {
      return next();
    }

    if (task.createdBy.toString() === req.user._id.toString()) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: "Görev atama yetkiniz yok" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Yetki kontrolü sırasında hata oluştu",
    });
  }
};

module.exports = {
  projectOwnerOrAuthorized,
  taskOwnerOrAuthorized,
  canCreateTask,
  canUpdateTask,
  canDeleteTask,
  canAssignTask,
};
