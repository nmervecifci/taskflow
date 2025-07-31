const Project = require("../models/Project");
const Task = require("../models/Task");

const getProjects = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let projects;

    switch (role) {
      case "Admin":
        // Admin tüm projeleri görebilir
        projects = await Project.find()
          .populate("owner", "username email role")
          .populate("members", "username email role")
          .sort({ createdAt: -1 });
        break;

      case "Manager":
        // Manager kendi projelerini + üye olduğu projeleri görebilir
        projects = await Project.find({
          $or: [{ owner: userId }, { members: userId }],
        })
          .populate("owner", "username email role")
          .populate("members", "username email role")
          .sort({ createdAt: -1 });
        break;

      case "Developer":
        // Developer sadece üye olduğu projeleri görebilir
        projects = await Project.find({
          members: userId,
        })
          .populate("owner", "username email role")
          .populate("members", "username email role")
          .sort({ createdAt: -1 });
        break;

      default:
        projects = [];
    }

    console.log(`📊 ${role} retrieved ${projects.length} projects`);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
      userRole: role,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Projeler yüklenirken hata oluştu",
    });
  }
};

const getProject = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const project = await Project.findById(req.params.id)
      .populate("owner", "username email role")
      .populate("members", "username email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı",
      });
    }

    // Yetki kontrolü
    const canView =
      role === "Admin" ||
      project.owner._id.toString() === userId.toString() ||
      project.members.some((user) => user._id.toString() === userId.toString());

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Bu projeyi görme yetkiniz yok",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Proje yüklenirken hata oluştu",
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, priority, endDate, members } = req.body;
    const { role, _id: userId } = req.user;

    // Görev taslağına göre: "Her kullanıcı proje oluşturabilir"
    // Role kontrolü kaldırıldı - tüm roller proje oluşturabilir

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Proje başlığı ve açıklama gereklidir",
      });
    }

    let projectMembers = [userId];
    if (members && Array.isArray(members)) {
      const uniqueMembers = [...new Set([userId, ...members])];
      projectMembers = uniqueMembers;
    }

    const project = await Project.create({
      title,
      description,
      priority: priority || "medium",
      endDate,
      owner: userId,
      members: projectMembers,
      status: "active",
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "username email role")
      .populate("members", "username email role");

    console.log(`✨ ${role} created project: ${project.title}`);

    res.status(201).json({
      success: true,
      message: "Proje başarıyla oluşturuldu",
      data: populatedProject,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Proje oluşturulurken hata oluştu",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı",
      });
    }

    const canEdit =
      role === "Admin" || project.owner.toString() === userId.toString();

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Bu projeyi düzenleme yetkiniz yok",
      });
    }

    const { title, description, priority, status, endDate } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(endDate && { endDate }),
      },
      { new: true, runValidators: true }
    )
      .populate("owner", "username email role")
      .populate("members", "username email role");

    console.log(`📝 ${role} updated project: ${updatedProject.title}`);

    res.status(200).json({
      success: true,
      message: "Proje başarıyla güncellendi",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Proje güncellenirken hata oluştu",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı",
      });
    }

    // Yetki kontrolü: Sadece proje sahibi veya Admin silebilir
    const canDelete =
      role === "Admin" || project.owner.toString() === userId.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Bu projeyi silme yetkiniz yok",
      });
    }

    // İlgili görevleri de sil
    await Task.deleteMany({ project: req.params.id });

    await Project.findByIdAndDelete(req.params.id);

    console.log(`🗑️ ${role} deleted project: ${project.title}`);

    res.status(200).json({
      success: true,
      message: "Proje ve ilgili görevler başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Proje silinirken hata oluştu",
    });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const { userId: userIdToAdd } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı",
      });
    }

    // Yetki kontrolü: Manager/Admin veya proje sahibi
    const canAddMembers =
      role === "Admin" ||
      role === "Manager" ||
      project.owner.toString() === userId.toString();

    if (!canAddMembers) {
      return res.status(403).json({
        success: false,
        message: "Projeye üye ekleme yetkiniz yok",
      });
    }

    if (project.members.includes(userIdToAdd)) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı zaten bu projede",
      });
    }

    project.members.push(userIdToAdd);
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate("owner", "username email role")
      .populate("members", "username email role");

    console.log(`👥 ${role} added member to project: ${project.title}`);

    res.status(200).json({
      success: true,
      message: "Üye başarıyla eklendi",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Add project member error:", error);
    res.status(500).json({
      success: false,
      message: "Üye eklenirken hata oluştu",
    });
  }
};

const removeProjectMember = async (req, res) => {
  try {
    const { role, _id: currentUserId } = req.user;
    const { userId: userIdToRemove } = req.params;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Proje bulunamadı",
      });
    }

    // Yetki kontrolü: Manager/Admin veya proje sahibi
    const canRemoveMembers =
      role === "Admin" ||
      role === "Manager" ||
      project.owner.toString() === currentUserId.toString();

    if (!canRemoveMembers) {
      return res.status(403).json({
        success: false,
        message: "Projeden üye çıkarma yetkiniz yok",
      });
    }

    // Üye projede var mı kontrol et
    if (!project.members.includes(userIdToRemove)) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı bu projede değil",
      });
    }

    // Proje sahibini çıkaramaz
    if (project.owner.toString() === userIdToRemove) {
      return res.status(400).json({
        success: false,
        message: "Proje sahibini projeden çıkaramazsınız",
      });
    }

    // Üyeyi çıkar
    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userIdToRemove
    );

    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate("owner", "username email role")
      .populate("members", "username email role");

    console.log(`👥 ${role} removed member from project: ${project.title}`);

    res.status(200).json({
      success: true,
      message: "Üye başarıyla projeden çıkarıldı",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Remove project member error:", error);
    res.status(500).json({
      success: false,
      message: "Üye çıkarılırken hata oluştu",
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};
