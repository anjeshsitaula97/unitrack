import { getConsultancyId, UNSCOPED_MODELS } from "./consultancy";
import { baseDb } from "./base-db";
import { resolveRequestConsultancyId } from "./request-tenancy";

// Operations that accept a `where` clause which should always be narrowed to
// the active consultancy. `findUnique` is included deliberately: Prisma supports
// non-unique filters alongside the unique selector, so `{ id }` calls still work.
const WHERE_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
]);

function createPrismaClient() {
  return baseDb.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Infrastructure models are never scoped, so skip resolution entirely.
          if (!model || UNSCOPED_MODELS.has(model)) {
            return query(args);
          }

          // An explicit AsyncLocalStorage context (via `runWithConsultancy`)
          // always wins, which cross-consultancy admin paths rely on. When it is
          // absent (`undefined`), fall back to resolving the active consultancy
          // from the request cookies.
          const explicit = getConsultancyId();
          const consultancyId =
            explicit !== undefined ? explicit : await resolveRequestConsultancyId();

          // Platform scope (Super Admin viewing all, or no session at all) means
          // no filtering.
          if (consultancyId == null) {
            return query(args);
          }

          const next = (args ?? {}) as Record<string, unknown>;

          if (operation === "create" || operation === "createMany") {
            const data = next.data;
            if (Array.isArray(data)) {
              next.data = data.map((row) => ({
                ...(row as Record<string, unknown>),
                consultancyId,
              }));
            } else if (data && typeof data === "object") {
              next.data = { ...(data as Record<string, unknown>), consultancyId };
            }
          } else if (operation === "upsert") {
            next.where = { ...((next.where as Record<string, unknown>) ?? {}), consultancyId };
            if (next.create && typeof next.create === "object") {
              next.create = {
                ...(next.create as Record<string, unknown>),
                consultancyId,
              };
            }
          } else if (WHERE_OPERATIONS.has(operation)) {
            next.where = { ...((next.where as Record<string, unknown>) ?? {}), consultancyId };
          }

          return query(next);
        },
      },
    },
  });
}

type DbClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: DbClient | undefined };

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
