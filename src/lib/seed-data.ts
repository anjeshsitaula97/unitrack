import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  const [u1, u2] = await Promise.all([
    prisma.university.create({
      data: {
        name: "Stanford University",
        country: "USA",
        city: "Stanford",
        website: "https://stanford.edu",
        founded: 1885,
        accreditation: "WSCUC",
        ranking: 2,
        status: "Active",
        isFeatured: true,
        courses: {
          create: [
            {
              name: "Computer Science",
              faculty: "Engineering",
              degreeType: "Bachelor",
              level: "Undergraduate",
              credits: 180,
              duration: "4 years",
              enrolled: 450,
              startDate: new Date("2026-09-01"),
              color: "#8C1515",
              initials: "CS",
              instructor: "Prof. John Doe",
              description: "Core CS curriculum.",
              prerequisites: "Mathematics",
              isFeatured: true,
            },
            {
              name: "Artificial Intelligence",
              faculty: "Engineering",
              degreeType: "Master",
              level: "Postgraduate",
              credits: 45,
              duration: "2 years",
              enrolled: 80,
              startDate: new Date("2026-09-01"),
              color: "#8C1515",
              initials: "AI",
              instructor: "Prof. Jane Smith",
              description: "Advanced AI topics.",
              prerequisites: "CS Degree",
              isFeatured: false,
            },
          ],
        },
      },
    }),
    prisma.university.create({
      data: {
        name: "Oxford University",
        country: "UK",
        city: "Oxford",
        website: "https://ox.ac.uk",
        founded: 1096,
        accreditation: "Royal Charter",
        ranking: 1,
        status: "Active",
        isFeatured: true,
        courses: {
          create: [
            {
              name: "Philosophy, Politics and Economics",
              faculty: "Social Sciences",
              degreeType: "Bachelor",
              level: "Undergraduate",
              credits: 360,
              duration: "3 years",
              enrolled: 190,
              startDate: new Date("2026-10-01"),
              color: "#002147",
              initials: "PPE",
              instructor: "Prof. David Hume",
              description: "The famous PPE course.",
              prerequisites: "None",
              isFeatured: true,
            },
          ],
        },
      },
    }),
  ]);

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
