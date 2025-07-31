// components/TaskActions.js
import React from "react";
import { useRoleAccess } from "../hooks/useRoleAccess";

const TaskActions = ({
  task,
  project,
  onEdit,
  onDelete,
  onAssign,
  onStatusChange,
}) => {
  const { user, isAdmin, isManager } = useRoleAccess();

  const isTaskOwner =
    task?.createdBy?._id === user?.id || task?.createdBy === user?.id;
  const isAssigned =
    task?.assignedTo?._id === user?.id || task?.assignedTo === user?.id;
  const isProjectOwner =
    project?.owner?._id === user?.id || project?.owner === user?.id;
  const isProjectMember = project?.members?.some(
    (member) => (typeof member === "string" ? member : member._id) === user?.id
  );

  const canEdit = isAdmin() || isManager() || isTaskOwner || isProjectOwner;
  const canDelete = isAdmin() || isManager() || isTaskOwner || isProjectOwner;
  const canAssign = isAdmin() || isManager() || isProjectOwner || isTaskOwner;
  const canChangeStatus =
    isAdmin() || isManager() || isTaskOwner || isAssigned || isProjectOwner;

  if (!canEdit && !canDelete && !canAssign && !canChangeStatus) {
    return null; // Hiçbir işlem yapılamıyorsa hiçbir şey gösterme
  }

  return (
    <div className="flex items-center space-x-1">
      {/* Status Değiştirme */}
      {canChangeStatus && (
        <div className="relative group">
          <button className="p-1 text-gray-400 hover:text-blue-600">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4 4m4-4l-4-4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>
          <div className="absolute right-0 top-6 hidden group-hover:block bg-white border rounded-lg shadow-lg z-10 w-32">
            {task.status !== "pending" && (
              <button
                onClick={() => onStatusChange("pending")}
                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
              >
                Bekleyen
              </button>
            )}
            {task.status !== "in-progress" && (
              <button
                onClick={() => onStatusChange("in-progress")}
                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
              >
                Devam Eden
              </button>
            )}
            {task.status !== "completed" && (
              <button
                onClick={() => onStatusChange("completed")}
                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
              >
                Tamamlanan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Task Düzenleme */}
      {canEdit && (
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-blue-600"
          title="Düzenle"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      )}

      {/* Task Atama */}
      {canAssign && (
        <button
          onClick={onAssign}
          className="p-1 text-gray-400 hover:text-green-600"
          title="Ata"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      )}

      {/* Task Silme */}
      {canDelete && (
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600"
          title="Sil"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TaskActions;
