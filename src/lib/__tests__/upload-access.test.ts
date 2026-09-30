import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  studentDocument: { findMany: vi.fn(), findFirst: vi.fn() },
  fileItem: { findFirst: vi.fn() },
  university: { findFirst: vi.fn() },
  branch: { findFirst: vi.fn() },
  user: { findFirst: vi.fn() },
  learningResource: { findFirst: vi.fn() },
  scannedDocument: { findFirst: vi.fn() },
  employeeDocument: { findFirst: vi.fn() },
  marketingMaterial: { findFirst: vi.fn() },
}));

vi.mock("../db", () => ({ db }));

import { authorizeUploadAccess } from "../upload-access";

const staff = (id: number, role: string) => ({ id, email: "a@b.c", role }) as never;
const student = (id: number) =>
  ({ id, email: "s@b.c", role: "Student", subject: "student" }) as never;

const none = () => null;
const resetAll = () => {
  Object.values(db).forEach((model) => {
    Object.values(model).forEach((fn) => fn.mockReset().mockResolvedValue(null));
  });
};

beforeEach(resetAll);

describe("authorizeUploadAccess", () => {
  it("denies when there is no session at all", async () => {
    expect(await authorizeUploadAccess("a.png", none(), none())).toBe("deny");
  });

  it("denies a student reaching a file that is not their own document", async () => {
    db.studentDocument.findMany.mockResolvedValue([]);
    expect(await authorizeUploadAccess("a.png", none(), student(7))).toBe("deny");
  });

  it("allows a student to read their own document", async () => {
    db.studentDocument.findMany.mockResolvedValue([{ id: 1 }]);
    expect(await authorizeUploadAccess("a.png", none(), student(7))).toBe("allow");
  });

  it("denies a non-staff role reading a private file-manager entry", async () => {
    db.fileItem.findFirst.mockResolvedValue({ userId: 2, url: "/uploads/a.png" });
    expect(await authorizeUploadAccess("a.png", staff(4, "Viewer"), none())).toBe("deny");
  });

  it("denies staff reading another user's private file", async () => {
    db.fileItem.findFirst.mockResolvedValue({ userId: 2, url: "/uploads/a.png" });
    expect(await authorizeUploadAccess("a.png", staff(3, "Staff"), none())).toBe("deny");
  });

  it("allows the owner to read their own private file", async () => {
    db.fileItem.findFirst.mockResolvedValue({ userId: 3, url: "/uploads/a.png" });
    expect(await authorizeUploadAccess("a.png", staff(3, "Staff"), none())).toBe("allow");
  });

  it("allows an admin to read any private file", async () => {
    db.fileItem.findFirst.mockResolvedValue({ userId: 99, url: "/uploads/a.png" });
    expect(await authorizeUploadAccess("a.png", staff(2, "Super Admin"), none())).toBe("allow");
  });

  it("allows a non-staff role to read shared branding", async () => {
    db.university.findFirst.mockResolvedValue({ id: 1 });
    expect(await authorizeUploadAccess("a.png", staff(4, "Viewer"), none())).toBe("allow");
  });

  it("denies a file that no record claims", async () => {
    expect(await authorizeUploadAccess("orphan.png", staff(2, "Super Admin"), none())).toBe("deny");
  });

  it("does not match a file whose owner stores a different path", async () => {
    db.fileItem.findFirst.mockResolvedValue({ userId: 3, url: "/uploads/other.png" });
    expect(await authorizeUploadAccess("a.png", staff(3, "Staff"), none())).toBe("deny");
  });

  describe("path matching", () => {
    /**
     * Rows store an absolute public path ("/uploads/<name>") while the route
     * resolves a bare relative path ("<name>"). These assert the query itself
     * rather than a mocked return value, because an equality comparison
     * silently denied every shared logo even when the row existed.
     */
    const whereFor = (model: keyof typeof db, call = 0) =>
      (db[model].findFirst as ReturnType<typeof vi.fn>).mock.calls[call][0].where;

    it("matches shared branding by suffix, not equality", async () => {
      db.university.findFirst.mockResolvedValue({ id: 1 });
      await authorizeUploadAccess("logo.png", staff(4, "Viewer"), none());
      expect(whereFor("university")).toEqual({ logo: { endsWith: "logo.png" } });
    });

    it("applies the same suffix match to branch, avatar and learning resources", async () => {
      db.university.findFirst.mockResolvedValue({ id: 1 });
      await authorizeUploadAccess("logo.png", staff(4, "Viewer"), none());
      expect(whereFor("branch")).toEqual({ logo: { endsWith: "logo.png" } });
      expect(whereFor("user")).toEqual({ avatar: { endsWith: "logo.png" } });
      expect(whereFor("learningResource")).toEqual({ url: { endsWith: "logo.png" } });
    });

    it("matches private file rows by suffix as well", async () => {
      db.fileItem.findFirst.mockResolvedValue({ userId: 3, url: "/uploads/a.png" });
      await authorizeUploadAccess("a.png", staff(3, "Staff"), none());
      expect(whereFor("fileItem")).toEqual({ url: { endsWith: "a.png" } });
    });

    it("matches a student document by suffix", async () => {
      db.studentDocument.findMany.mockResolvedValue([{ id: 1 }]);
      await authorizeUploadAccess("doc.pdf", none(), student(7));
      expect(db.studentDocument.findMany.mock.calls[0][0].where).toEqual({
        studentId: 7,
        url: { endsWith: "doc.pdf" },
      });
    });
  });
});
