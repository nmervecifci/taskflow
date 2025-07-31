// components/ProjectActions.js
import React from "react";
import { useRoleAccess } from "../hooks/useRoleAccess";

const ProjectActions = ({ project, onEdit, onDelete, onAddMember }) => {
  const { user, isAdmin, isManagerOrAdmin } = useRoleAccess();

  const isProjectOwner =
    project?.owner?._id === user?.id || project?.owner === user?.id;
  const canEdit = isAdmin() || isProjectOwner;
  const canDelete = isAdmin() || isProjectOwner;
  const canAddMembers = isManagerOrAdmin() || isProjectOwner;

  return (
    <div className="flex items-center space-x-2">
      {/* Proje Düzenleme - Sadece sahip veya Admin */}
      {canEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
          title="Projeyi Düzenle"
        >
          <svg
            className="w-4 h-4"
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

      {/* Üye Ekleme - Manager/Admin veya sahip */}
      {canAddMembers && (
        <button
          onClick={onAddMember}
          className="p-2 text-green-600 hover:text-green-800 rounded-lg hover:bg-green-50"
          title="Üye Ekle"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </button>
      )}

      {/* Proje Silme - Sadece sahip veya Admin */}
      {canDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
          title="Projeyi Sil"
        >
          <svg
            className="w-4 h-4"
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

      {/* Rol Badge */}
      <div className="ml-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isAdmin()
              ? "bg-purple-100 text-purple-800"
              : isManagerOrAdmin()
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user?.role}
        </span>
      </div>
    </div>
  );
};

export default ProjectActions;


