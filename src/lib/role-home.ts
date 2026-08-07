export function getRoleHome(role?: string | null): string {
  const r = (role || "").toLowerCase().trim();
  if (r === "super admin") return "/dashboard";
  if (r === "administrator" || r === "admin") return "/admin-dashboard";
  if (r === "b2b partner" || r === "partner") return "/partner-dashboard";
  return "/dashboard";
}

export function isDashboardRoute(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/admin-dashboard" ||
    pathname === "/partner-dashboard"
  );
}
