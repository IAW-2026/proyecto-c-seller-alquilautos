export type Role = "propietario" | "adminSeller" | "adminGlobal";

export function isAdminRole(role?: string | null): boolean {
  return role === "adminSeller" || role === "adminGlobal";
}
