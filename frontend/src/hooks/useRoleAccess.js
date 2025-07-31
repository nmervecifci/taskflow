import { useSelector } from "react-redux";

export const useRoleAccess = () => {
  const { user } = useSelector((state) => state.auth);

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    return Array.isArray(roles)
      ? roles.includes(user.role)
      : user.role === roles;
  };

  const isAdmin = () => hasRole("Admin");
  const isManager = () => hasRole("Manager");
  const isDeveloper = () => hasRole("Developer");
  const isManagerOrAdmin = () => hasRole(["Manager", "Admin"]);

  return {
    user,
    hasRole,
    isAdmin,
    isManager,
    isDeveloper,
    isManagerOrAdmin,
  };
};


