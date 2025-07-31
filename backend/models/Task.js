const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Task title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxlength: [1000, "Task description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Task must belong to a project"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required"],
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, "Tag cannot exceed 20 characters"],
      },
    ],
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
        },
        mimetype: {
          type: String,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: [true, "Comment content is required"],
          maxlength: [500, "Comment cannot exceed 500 characters"],
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        editedAt: {
          type: Date,
        },
      },
    ],
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ title: "text", description: "text" });

// Virtual for overdue tasks
taskSchema.virtual("isOverdue").get(function () {
  return (
    this.dueDate && this.dueDate < new Date() && this.status !== "completed"
  );
});

// Virtual for task completion percentage
taskSchema.virtual("progressPercentage").get(function () {
  if (!this.estimatedHours || this.estimatedHours === 0) {
    return this.status === "completed" ? 100 : 0;
  }

  const percentage = (this.actualHours / this.estimatedHours) * 100;
  return Math.min(percentage, 100); // Cap at 100%
});

// Virtual for time remaining
taskSchema.virtual("timeRemaining").get(function () {
  if (!this.dueDate) return null;

  const now = new Date();
  const diff = this.dueDate.getTime() - now.getTime();

  if (diff <= 0) return "Overdue";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
  } else {
    return "Less than 1 hour remaining";
  }
});

// Pre-save middleware
taskSchema.pre("save", function (next) {
  // Auto-set completedAt when status changes to completed
  if (this.isModified("status")) {
    if (this.status === "completed" && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== "completed") {
      this.completedAt = undefined;
    }
  }

  // Automatically add creator to watchers
  if (this.isNew && this.createdBy && !this.watchers.includes(this.createdBy)) {
    this.watchers.push(this.createdBy);
  }

  // Automatically add assigned user to watchers
  if (
    this.isModified("assignedTo") &&
    this.assignedTo &&
    !this.watchers.includes(this.assignedTo)
  ) {
    this.watchers.push(this.assignedTo);
  }

  next();
});

// Static methods
taskSchema.statics.getTasksByStatus = function (status) {
  return this.find({ status })
    .populate("project", "title")
    .populate("assignedTo", "username name email")
    .populate("createdBy", "username name email");
};

taskSchema.statics.getOverdueTasks = function () {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: "completed" },
  })
    .populate("project", "title")
    .populate("assignedTo", "username name email")
    .populate("createdBy", "username name email");
};

taskSchema.statics.getTasksCompletedBetween = function (startDate, endDate) {
  return this.find({
    status: "completed",
    completedAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("project", "title")
    .populate("assignedTo", "username name email")
    .populate("createdBy", "username name email");
};

// Instance methods
taskSchema.methods.addWatcher = function (userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

taskSchema.methods.removeWatcher = function (userId) {
  this.watchers = this.watchers.filter((watcher) => !watcher.equals(userId));
  return this.save();
};

taskSchema.methods.canBeEditedBy = function (user) {
  return (
    user.role === "Admin" ||
    user.role === "Manager" ||
    this.createdBy.equals(user._id) ||
    (this.assignedTo && this.assignedTo.equals(user._id))
  );
};

taskSchema.methods.canBeDeletedBy = function (user) {
  return (
    user.role === "Admin" ||
    user.role === "Manager" ||
    this.createdBy.equals(user._id)
  );
};

// Ensure virtual fields are serialized
taskSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove sensitive or unnecessary fields
    delete ret.__v;
    return ret;
  },
});

taskSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
