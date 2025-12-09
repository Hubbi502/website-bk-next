export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export interface AdminData {
  id: string;
  name: string;
  username: string;
  role: AdminRole;
}

export function isSuperAdmin(admin: AdminData | null): boolean {
  return admin?.role === "SUPER_ADMIN";
}

export function isAdmin(admin: AdminData | null): boolean {
  return admin?.role === "ADMIN" || admin?.role === "SUPER_ADMIN";
}

export function hasPermission(admin: AdminData | null, requiredRole: AdminRole): boolean {
  if (!admin) return false;
  
  // Super admin has all permissions
  if (admin.role === "SUPER_ADMIN") return true;
  
  // Check if admin has the required role
  return admin.role === requiredRole;
}

export function canManageAdmins(admin: AdminData | null): boolean {
  return isSuperAdmin(admin);
}

export function canManageArticles(admin: AdminData | null): boolean {
  return isAdmin(admin);
}

export function canManageVisits(admin: AdminData | null): boolean {
  return isAdmin(admin);
}
