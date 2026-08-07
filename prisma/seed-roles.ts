import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  "p1",
  "p2",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
  "p9",
  "p10",
  "p11",
  "p12",
  "p13",
  "p14",
  "p15",
  "p16",
  "p17",
  "p18",
  "p19",
  "p20",
  "p21",
  "p22",
  "p23",
  "p24",
  "p25",
  "p26",
  "p27",
  "p28",
  "p29",
  "p30",
  "p31",
  "p32",
  "p33",
  "p34",
  "p35",
  "p36",
  "p37",
  "p38",
  "p39",
  "p40",
  "p41",
  "p42",
  "p43",
  "p44",
  "p45",
  "p46",
  "p47",
  "p48",
  "p49",
  "p50",
];

const INITIAL_ROLES = [
  {
    name: "Super Admin",
    description: "Super administrator with unrestricted system-wide access.",
    permissions: JSON.stringify(ALL_PERMISSIONS),
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
  {
    name: "Administrator",
    description: "Full access to all modules and settings.",
    permissions: JSON.stringify(ALL_PERMISSIONS),
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  {
    name: "Moderator",
    description: "Can manage courses and universities but cannot edit system settings.",
    permissions: JSON.stringify([
      "p1",
      "p2",
      "p3",
      "p4",
      "p6",
      "p7",
      "p8",
      "p9",
      "p10",
      "p12",
      "p13",
      "p14",
      "p21",
      "p25",
      "p28",
      "p30",
      "p32",
      "p35",
      "p36",
      "p37",
      "p42",
    ]),
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    name: "Editor",
    description: "Can edit content but cannot approve or delete.",
    permissions: JSON.stringify([
      "p1",
      "p2",
      "p4",
      "p8",
      "p10",
      "p14",
      "p16",
      "p21",
      "p23",
      "p28",
      "p30",
      "p32",
      "p42",
    ]),
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    name: "Viewer",
    description: "Read-only access to all modules.",
    permissions: JSON.stringify([
      "p1",
      "p2",
      "p8",
      "p14",
      "p21",
      "p28",
      "p30",
      "p32",
      "p35",
      "p42",
    ]),
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
  {
    name: "B2B Partner",
    description:
      "B2B recruitment partner — views partnerships, commissions, universities, and referred students.",
    permissions: JSON.stringify([
      "p1",
      "p2",
      "p3",
      "p8",
      "p10",
      "p14",
      "p21",
      "p28",
      "p30",
      "p32",
      "p35",
      "p42",
    ]),
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
  },
  {
    name: "Student",
    description: "Student portal access — can view own applications, payments, and documents.",
    permissions: JSON.stringify([]),
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
];

async function main() {
  console.log("Seeding roles...");
  await Promise.all(
    INITIAL_ROLES.map((role) =>
      prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role,
      })
    )
  );
  console.log("Roles seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
