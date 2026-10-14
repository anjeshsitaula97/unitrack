import { PrismaClient } from "@prisma/client";

/**
 * A raw, un-extended Prisma client. This is the single underlying engine that
 * the scoped client in `db.ts` extends, and it is also used for identity and
 * tenancy lookups that must never be filtered by the active consultancy
 * (session resolution, login, the tenancy resolver itself).
 */
const globalForBase = globalThis as unknown as { basePrisma?: PrismaClient };

export const baseDb = globalForBase.basePrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForBase.basePrisma = baseDb;
