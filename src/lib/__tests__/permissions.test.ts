import { describe, it, expect } from "vitest";
import { hasPermission, checkPermission, getRoutePermission } from "../permissions";

describe("Permissions", () => {
  describe("hasPermission", () => {
    it("grants admin access to all resources", () => {
      expect(hasPermission("admin", "students:read")).toBe(true);
      expect(hasPermission("admin", "students:create")).toBe(true);
      expect(hasPermission("admin", "students:delete")).toBe(true);
      expect(hasPermission("admin", "payments:delete")).toBe(true);
      expect(hasPermission("admin", "bulk:import")).toBe(true);
      expect(hasPermission("admin", "admin:access")).toBe(true);
    });

    it("grants staff limited access", () => {
      expect(hasPermission("staff", "students:read")).toBe(true);
      expect(hasPermission("staff", "students:create")).toBe(true);
      expect(hasPermission("staff", "students:delete")).toBe(false);
      expect(hasPermission("staff", "payments:delete")).toBe(false);
      expect(hasPermission("staff", "bulk:import")).toBe(false);
      expect(hasPermission("staff", "bulk:export")).toBe(true);
    });

    it("grants student access to read-only resources", () => {
      expect(hasPermission("student", "students:read")).toBe(true);
      expect(hasPermission("student", "courses:read")).toBe(true);
      expect(hasPermission("student", "applications:read")).toBe(true);
      expect(hasPermission("student", "applications:create")).toBe(false);
      expect(hasPermission("student", "leads:read")).toBe(false);
      expect(hasPermission("student", "hr:read")).toBe(false);
    });

    it("denies access for unknown role", () => {
      expect(hasPermission("unknown", "students:read")).toBe(false);
      expect(hasPermission(undefined, "students:read")).toBe(false);
    });

    it("denies access for unknown permission", () => {
      expect(hasPermission("admin", "unknown:permission")).toBe(false);
    });
  });

  describe("checkPermission", () => {
    it("returns null when allowed", () => {
      expect(checkPermission("admin", "students:delete")).toBeNull();
    });

    it("returns error string when denied", () => {
      expect(checkPermission("staff", "students:delete")).toBe(
        "Forbidden: insufficient permissions"
      );
    });
  });

  describe("getRoutePermission", () => {
    it("maps routes to correct permissions", () => {
      expect(getRoutePermission("/students")).toBe("students:read");
      expect(getRoutePermission("/students/123")).toBe("students:read");
      expect(getRoutePermission("/universities")).toBe("universities:read");
      expect(getRoutePermission("/courses")).toBe("courses:read");
      expect(getRoutePermission("/payments")).toBe("payments:read");
      expect(getRoutePermission("/hr/employees")).toBe("hr:read");
      expect(getRoutePermission("/settings")).toBe("settings:read");
    });

    it("returns null for unknown routes", () => {
      expect(getRoutePermission("/unknown-route")).toBeNull();
    });
  });
});
