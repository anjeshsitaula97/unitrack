import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => {
  const mockCreate = vi.fn().mockResolvedValue(undefined);
  return {
    db: {
      notification: {
        create: mockCreate,
      },
    },
  };
});

import { createNotification } from "../notifications";
import { db } from "../db";

describe("createNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a notification without userId", async () => {
    await createNotification({
      title: "Test",
      message: "Test message",
      type: "Info",
    });

    expect(db.notification.create).toHaveBeenCalledOnce();
    expect(db.notification.create).toHaveBeenCalledWith({
      data: {
        userId: null,
        title: "Test",
        message: "Test message",
        type: "Info",
      },
    });
  });

  it("creates a notification with userId", async () => {
    await createNotification({
      userId: "user-1",
      title: "Test",
      message: "Test message",
      type: "Warning",
    });

    expect(db.notification.create).toHaveBeenCalledOnce();
    expect(db.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        title: "Test",
        message: "Test message",
        type: "Warning",
      },
    });
  });
});
