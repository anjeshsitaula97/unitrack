import { Prisma } from "@prisma/client";
import { db } from "./db";

const EXPIRY_DAYS = 30;

export interface PurgeResult {
  purged: number;
  failed: number;
}

async function recordTrashItem(entityType: string, entityId: string | number, entityName: string) {
  const idStr = String(entityId);
  // Replace any stale, not-yet-restored row for the same entity so repeated
  // delete cycles don't pile up duplicate recycle-bin entries.
  await db.trashItem.deleteMany({
    where: { entityType, entityId: idStr, restoredAt: null },
  });
  await db.trashItem.create({
    data: {
      entityType,
      entityId: idStr,
      entityName,
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });
}

export async function softDeleteStudent(id: string) {
  const numId = Number(id);
  const student = await db.student.update({ where: { id: numId }, data: { status: "Deleted" } });
  const displayName =
    student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown";
  await recordTrashItem("Student", numId, displayName);
  return student;
}

export async function softDeleteUniversity(id: string | number) {
  const numId = Number(id);
  const uni = await db.university.update({ where: { id: numId }, data: { status: "Deleted" } });
  await recordTrashItem("University", numId, uni.name || "Unknown University");
  return uni;
}

export async function softDeleteCourse(id: string | number) {
  const numId = Number(id);
  const course = await db.course.update({ where: { id: numId }, data: { status: "Deleted" } });
  await recordTrashItem("Course", numId, course.name || "Unknown Course");
  return course;
}

export async function softDeleteLead(id: string | number) {
  const numId = Number(id);
  const lead = await db.lead.update({ where: { id: numId }, data: { status: "Deleted" } });
  await recordTrashItem("Lead", numId, lead.name || "Unknown Lead");
  return lead;
}

export async function softDeleteApplication(id: string | number) {
  const numId = Number(id);
  const [application, student] = await Promise.all([
    db.application.update({ where: { id: numId }, data: { status: "Deleted" } }),
    db.application
      .findUnique({ where: { id: numId }, select: { student: { select: { name: true } } } })
      .then((row) => row?.student?.name),
  ]);
  await recordTrashItem("Application", numId, student || `Application #${numId}`);
  return application;
}

export async function restoreFromTrash(id: string | number) {
  const item = await db.trashItem.findUnique({ where: { id: Number(id) } });
  if (!item) throw new Error("Trash item not found");

  const entityIdNum = Number(item.entityId);

  switch (item.entityType) {
    case "Student":
      await db.student.update({ where: { id: entityIdNum }, data: { status: "New Leads" } });
      break;
    case "University":
      await db.university.update({ where: { id: entityIdNum }, data: { status: "Active" } });
      break;
    case "Course":
      await db.course.update({ where: { id: entityIdNum }, data: { status: "Active" } });
      break;
    case "Lead":
      await db.lead.update({ where: { id: entityIdNum }, data: { status: "New" } });
      break;
    case "Application":
      await db.application.update({ where: { id: entityIdNum }, data: { status: "Submitted" } });
      break;
  }

  await db.trashItem.update({ where: { id: Number(id) }, data: { restoredAt: new Date() } });
  return item;
}

function isRecordMissing(error: unknown): boolean {
  // P2025 = "Record to delete does not exist" — the entity was already removed
  // elsewhere, leaving an orphaned recycle-bin row we can safely drop.
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

async function permanentlyDeleteEntity(entityType: string, entityId: number): Promise<void> {
  switch (entityType) {
    case "Student":
      await db.student.delete({ where: { id: entityId } });
      break;
    case "University":
      await db.university.delete({ where: { id: entityId } });
      break;
    case "Course":
      await db.course.delete({ where: { id: entityId } });
      break;
    case "Lead":
      await db.lead.delete({ where: { id: entityId } });
      break;
    case "Application":
      await db.application.delete({ where: { id: entityId } });
      break;
  }
}

async function purgeItems(
  items: Array<{ id: number; entityType: string; entityId: string }>
): Promise<PurgeResult> {
  const outcomes = await Promise.all(
    items.map(async (item) => {
      const entityIdNum = Number(item.entityId);

      try {
        await permanentlyDeleteEntity(item.entityType, entityIdNum);
      } catch (error) {
        if (!isRecordMissing(error)) {
          console.error(
            `Failed to purge ${item.entityType} ${item.entityId}:`,
            error instanceof Error ? error.message : error
          );
          return "failed" as const;
        }
        // The underlying record was already removed elsewhere; the trash row is
        // simply an orphan, so fall through and remove it.
      }

      try {
        await db.trashItem.delete({ where: { id: item.id } });
      } catch (error) {
        if (!isRecordMissing(error)) {
          console.error(
            `Failed to remove trash row ${item.id}:`,
            error instanceof Error ? error.message : error
          );
          return "failed" as const;
        }
      }
      return "purged" as const;
    })
  );

  const purged = outcomes.filter((outcome) => outcome === "purged").length;
  const failed = outcomes.length - purged;

  return { purged, failed };
}

export async function purgeExpiredTrash(): Promise<PurgeResult> {
  const expired = await db.trashItem.findMany({
    where: { expiresAt: { lt: new Date() }, restoredAt: null },
  });

  return purgeItems(expired);
}

export async function purgeAllTrash(): Promise<PurgeResult> {
  const items = await db.trashItem.findMany({
    where: { restoredAt: null },
  });

  return purgeItems(items);
}
