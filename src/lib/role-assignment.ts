import { db } from "./db";
import { assertAssignableRole } from "./rbac";
import { roleSlugFor, SUPER_ADMIN_ROLE } from "./permission-catalog";

/**
 * Role names that must always be assignable because live accounts use them.
 * `User.role` is a free-form string, so this list plus the Role table plus the
 * catalog slugs is the full set of names the platform recognises.
 */
const BUILT_IN_ROLE_NAMES = new Set<string>([
  SUPER_ADMIN_ROLE,
  "Admin",
  "Staff",
  "Viewer",
  "Student",
]);

/**
 * Validates a role an actor is trying to write onto a user.
 *
 * Returns `null` when the assignment is allowed, or a human-readable reason to
 * return to the client otherwise.
 *
 * Two distinct protections live here:
 *  - `assertAssignableRole` stops a lesser role minting `Super Admin`, which is
 *    the one role with an unconditional bypass in `hasPermission`.
 *  - The name check stops arbitrary strings being persisted into `User.role`,
 *    which would otherwise create a role that silently resolves to no
 *    permissions at all.
 */
export async function validateRoleAssignment(
  actorRole: string | undefined | null,
  targetRole: unknown
): Promise<string | null> {
  if (typeof targetRole !== "string") return "Role must be a string";

  const target = targetRole.trim();
  const escalation = assertAssignableRole(actorRole, target);
  if (escalation) return escalation;

  if (BUILT_IN_ROLE_NAMES.has(target)) return null;
  // Covers custom names that still map onto a catalog slug, e.g. "Administrator".
  if (roleSlugFor(target)) return null;

  try {
    const existing = await db.role.findFirst({
      where: { name: target },
      select: { id: true },
    });
    if (existing) return null;
  } catch {
    // If the lookup fails, refuse rather than persist an unvalidated role.
    return "Unable to verify role, please try again";
  }

  return `Unknown role "${target}"`;
}
