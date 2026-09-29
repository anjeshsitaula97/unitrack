import { db } from "./db";

const EXPIRY_DAYS = 30;

export async function softDeleteStudent(id: string) {
  const numId = Number(id);
  const student = await db.student.update({ where: { id: numId }, data: { status: "Deleted" } });
  const displayName =
    student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown";
  await db.trashItem.create({
    data: {
      entityType: "Student",
      entityId: String(numId),
      entityName: displayName,
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return student;
}

export async function softDeleteUniversity(id: string | number) {
  const numId = Number(id);
  const uni = await db.university.update({ where: { id: numId }, data: { status: "Deleted" } });
  await db.trashItem.create({
    data: {
      entityType: "University",
      entityId: String(numId),
      entityName: uni.name || "Unknown University",
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return uni;
}

export async function softDeleteCourse(id: string | number) {
  const numId = Number(id);
  const course = await db.course.update({ where: { id: numId }, data: { status: "Deleted" } });
  await db.trashItem.create({
    data: {
      entityType: "Course",
      entityId: String(numId),
      entityName: course.name || "Unknown Course",
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return course;
}

export async function softDeleteLead(id: string | number) {
  const numId = Number(id);
  const lead = await db.lead.update({ where: { id: numId }, data: { status: "Deleted" } });
  await db.trashItem.create({
    data: {
      entityType: "Lead",
      entityId: String(numId),
      entityName: lead.name || "Unknown Lead",
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return lead;
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
  }

  await db.trashItem.update({ where: { id: Number(id) }, data: { restoredAt: new Date() } });
  return item;
}

export async function purgeExpiredTrash() {
  const expired = await db.trashItem.findMany({
    where: { expiresAt: { lt: new Date() }, restoredAt: null },
  });

  let purged = 0;
  for (const item of expired) {
    try {
      const entityIdNum = Number(item.entityId);
      switch (item.entityType) {
        case "Student":
          await db.student.delete({ where: { id: entityIdNum } });
          break;
        case "University":
          await db.university.delete({ where: { id: entityIdNum } });
          break;
        case "Course":
          await db.course.delete({ where: { id: entityIdNum } });
          break;
        case "Lead":
          await db.lead.delete({ where: { id: entityIdNum } });
          break;
      }
      await db.trashItem.delete({ where: { id: item.id } });
      purged++;
    } catch (error) {
      // Keep the TrashItem so the purge is retried on the next run instead of
      // orphaning a row that is still flagged as deleted.
      console.error(
        `Failed to purge ${item.entityType} ${item.entityId}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return purged;
}
