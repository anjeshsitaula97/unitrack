import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const QUALIFICATIONS = [
  // Level 1: Equivalent to Grade 10
  { name: "SEE", level: 1 },
  { name: "Grade 10", level: 1 },

  // Level 2: Equivalent to Grade 12
  { name: "Diploma", level: 2 },
  { name: "Grade 12", level: 2 },
  { name: "SLC", level: 2 },
  { name: "+2", level: 2 },
  { name: "Plus 2", level: 2 },
  { name: "Grade XII", level: 2 },
  { name: "PCL", level: 2 },

  // Level 3: Bachelor (3-4 years after Grade 12)
  { name: "Bachelor", level: 3 },
  { name: "Bachelors", level: 3 },
  { name: "Undergraduate", level: 3 },
  { name: "B.Ed", level: 3 },
  { name: "B.Sc", level: 3 },
  { name: "B.A", level: 3 },
  { name: "B.Com", level: 3 },
  { name: "B.Tech", level: 3 },
  { name: "B.E", level: 3 },
  { name: "MBBS", level: 3 },
  { name: "BDS", level: 3 },
  { name: "B.Pharm", level: 3 },
  { name: "BBA", level: 3 },
  { name: "BCA", level: 3 },
  { name: "LLB", level: 3 },

  // Level 4: Masters (2 years after Bachelor)
  { name: "Master", level: 4 },
  { name: "Masters", level: 4 },
  { name: "Postgraduate", level: 4 },
  { name: "M.Ed", level: 4 },
  { name: "M.Sc", level: 4 },
  { name: "M.A", level: 4 },
  { name: "M.Com", level: 4 },
  { name: "M.Tech", level: 4 },
  { name: "M.E", level: 4 },
  { name: "MBA", level: 4 },
  { name: "MCA", level: 4 },
  { name: "MPH", level: 4 },
  { name: "LLM", level: 4 },
  { name: "MD", level: 4 },
  { name: "MS", level: 4 },
  { name: "M.Pharm", level: 4 },

  // Level 5: PhD/Doctorate
  { name: "PhD", level: 5 },
  { name: "Doctorate", level: 5 },
  { name: "DPhil", level: 5 },
];

async function main() {
  console.log("Seeding qualifications...");
  await Promise.all(
    QUALIFICATIONS.map((q) =>
      prisma.qualification.upsert({
        where: { name: q.name },
        update: { level: q.level },
        create: q,
      })
    )
  );
  console.log("Qualifications seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });