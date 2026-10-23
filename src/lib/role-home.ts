/**
 * The Super Admin dashboard. It lives under the console URL space (so an expired
 * session on it is bounced to the Super Admin login, not the tenant login) but is
 * rendered with the ordinary app shell, identically to /dashboard.
 */
export const SUPER_ADMIN_DASHBOARD_PATH = "/appconsole/sadashboard";

export function getRoleHome(role?: string | null): string {
  const r = (role || "").toLowerCase().trim();
  if (r === "super admin") return "/dashboard";
  if (r === "administrator" || r === "admin") return "/admin-dashboard";
  if (r === "b2b partner" || r === "partner") return "/partner-dashboard";
  return "/dashboard";
}

/** Routes owned by the Super Admin console rather than the tenant app. */
export function isConsoleRoute(pathname: string): boolean {
  return pathname === "/appconsole" || pathname.startsWith("/appconsole/");
}

/**
 * The login page that owns a given route. Console routes must return to the
 * branded Super Admin login so a signed-out super admin is never handed the
 * tenant form (and vice versa).
 */
export function getLoginPathFor(pathname: string): string {
  return isConsoleRoute(pathname) ? "/appconsole/login" : "/login";
}

export function isDashboardRoute(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/admin-dashboard" ||
    pathname === "/partner-dashboard"
  );
}
