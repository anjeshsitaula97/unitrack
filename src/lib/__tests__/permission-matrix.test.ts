import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/permissions";

/**
 * Guards the matrix itself. `hasPermission` lowercases the caller's role, so a
 * capitalised role like "Viewer" silently granted nothing before this file
 * existed; these assertions pin the canonical spelling.
 */
describe("permission matrix", () => {
  it("resolves the canonical Viewer role", () => {
    expect(hasPermission("Viewer", "hr:read")).toBe(false);
    expect(hasPermission("viewer", "hr:read")).toBe(false);
  });

  it("keeps Viewer out of payroll entirely", () => {
    // Payroll rows carry salaries, so neither reading nor writing is allowed.
    expect(hasPermission("Viewer", "hr:payroll")).toBe(false);
    expect(hasPermission("Staff", "hr:payroll")).toBe(false);
    expect(hasPermission("Admin", "hr:payroll")).toBe(true);
  });

  it("lets staff read HR but not administer it", () => {
    expect(hasPermission("Staff", "hr:read")).toBe(true);
    expect(hasPermission("Staff", "hr:create")).toBe(false);
    expect(hasPermission("Staff", "hr:delete")).toBe(false);
  });

  it("treats students as read-only across the matrix", () => {
    expect(hasPermission("student", "students:read")).toBe(true);
    expect(hasPermission("student", "courses:read")).toBe(true);
    expect(hasPermission("student", "applications:read")).toBe(true);
    expect(hasPermission("student", "applications:create")).toBe(false);
    expect(hasPermission("student", "leads:read")).toBe(false);
    expect(hasPermission("student", "hr:read")).toBe(false);
  });

  it("restricts destructive and cross-entity operations to admins", () => {
    expect(hasPermission("Admin", "batch:write")).toBe(true);
    expect(hasPermission("Staff", "batch:write")).toBe(false);
    expect(hasPermission("Staff", "admin:access")).toBe(false);
    expect(hasPermission("Admin", "admin:access")).toBe(true);
  });

  it("does not resolve an unknown role to any permission", () => {
    expect(hasPermission("Unknown", "hr:read")).toBe(false);
    expect(hasPermission("", "students:read")).toBe(false);
  });
});
