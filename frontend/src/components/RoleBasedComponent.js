"use client";

import { useRoleAccess } from "@/hooks/useRoleAccess";

export default function RoleBasedComponent({
  allowedRoles,
  children,
  fallback = null,
}) {
  const { hasRole } = useRoleAccess();

  // Eğer allowedRoles belirtilmemişse, herkese göster
  if (!allowedRoles) {
    return children;
  }

  // Role kontrolü yap
  const hasPermission = hasRole(allowedRoles);

  // Yetkisi varsa children'ı göster, yoksa fallback'i
  return hasPermission ? children : fallback;
}


