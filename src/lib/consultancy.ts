import { AsyncLocalStorage } from "async_hooks";

/**
 * Per-request tenancy context. Every model row carries a `consultancyId`, and
 * the Prisma client extension in `db.ts` uses this context to transparently
 * scope reads and writes to a single consultancy.
 *
 * A `null` consultancyId means "platform scope" (Super Admin viewing every
 * consultancy). An entirely absent context also means platform scope, which is
 * what bootstrapping paths such as login and seeding rely on.
 */
export interface ConsultancyContext {
  consultancyId: number | null;
  consultancyCode?: string | null;
  isSuperAdmin?: boolean;
}

/** Models that are intentionally NOT scoped to a consultancy. */
export const UNSCOPED_MODELS = new Set<string>([
  "Consultancy",
  "RateLimitLog",
  "PasswordResetToken",
  // SaaS subscription orders belong to the platform, not a tenant.
  "CheckoutOrder",
]);

const storage = (() => {
  // The Prisma client extension caches itself on `globalThis` so it survives
  // dev HMR. The AsyncLocalStorage instance must persist the same way, otherwise
  // a reloaded module would expose a *different* `storage` than the cached
  // `db` extension captured, and `runWithConsultancy` would be invisible to it
  // (the extension would then fall back to the request cookie).
  const g = globalThis as unknown as {
    __unitrackConsultancyStorage?: AsyncLocalStorage<ConsultancyContext>;
  };
  if (!g.__unitrackConsultancyStorage) {
    g.__unitrackConsultancyStorage = new AsyncLocalStorage<ConsultancyContext>();
  }
  return g.__unitrackConsultancyStorage;
})();

export function getConsultancyContext(): ConsultancyContext | undefined {
  return storage.getStore();
}

/** Returns the active consultancy id, `null` for platform scope, or `undefined` when no context is set. */
export function getConsultancyId(): number | null | undefined {
  return storage.getStore()?.consultancyId;
}

export function enterConsultancy(ctx: ConsultancyContext): void {
  // enterWith mutates the current async execution context, so the filter stays
  // in effect for the rest of the request without having to thread the id
  // through every function.
  storage.enterWith(ctx);
}

export function runWithConsultancy<T>(ctx: ConsultancyContext, fn: () => T): T {
  return storage.run(ctx, fn);
}
