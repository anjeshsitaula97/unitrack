import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const INITIAL_ACTIVITIES = [
  {
    actorName: "David Amara",
    actorInitials: "DA",
    actorColor: "#6366f1",
    action: "updated system localization to",
    target: "United Kingdom",
    targetBy: "Admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
  },
  {
    actorName: "Sarah K.",
    actorInitials: "SK",
    actorColor: "#ec4899",
    action: "approved course application for",
    target: "Oxford University",
    targetBy: "Moderator",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hrs ago
  },
  {
    actorName: "System",
    actorInitials: "SY",
    actorColor: "#64748b",
    action: "automated backup completed for",
    target: "Database Cluster",
    targetBy: "System",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

async function run() {
  console.log("Seeding activities...");
  await Promise.all(INITIAL_ACTIVITIES.map((act) => db.activityLog.create({ data: act })));
  console.log("Activities seeded.");
}

run()
  .catch(console.error)
  .finally(() => db.$disconnect());
