const mongoose = require("mongoose");

const taskLogSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required"],
    },
    action: {
      type: String,
      required: [true, "Action type is required"],
      enum: [
        "created",
        "updated",
        "status_changed",
        "assigned",
        "unassigned",
        "comment_added",
        "attachment_added",
        "priority_changed",
        "due_date_changed",
        "completed",
        "reopened",
      ],
    },
    field: {
      type: String,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User who made the change is required"],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskLogSchema.index({ task: 1, createdAt: -1 });
taskLogSchema.index({ changedBy: 1 });
taskLogSchema.index({ action: 1 });

// Static method to create log entry
taskLogSchema.statics.createLog = async function (
  taskId,
  action,
  changedBy,
  options = {}
) {
  const logEntry = {
    task: taskId,
    action,
    changedBy,
    field: options.field,
    oldValue: options.oldValue,
    newValue: options.newValue,
    description: options.description,
    metadata: options.metadata || {},
  };

  return await this.create(logEntry);
};

// Method to get task history
taskLogSchema.statics.getTaskHistory = async function (taskId, limit = 50) {
  return await this.find({ task: taskId })
    .populate("changedBy", "username email")
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model("TaskLog", taskLogSchema);
