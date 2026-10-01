-- Revert multi-tenancy step 1.
--
-- The Tenant model and the tenantId / seesAllBranches columns are being removed
-- for now, so this undoes 20250101000000_add_tenant_and_branches. Only users and
-- branches were ever scoped, and business data (Student, Lead, Payment, ...) was
-- never scoped at all, so nothing else references a tenant.
--
-- DESTRUCTIVE: Branch.tenantId is NOT NULL with ON DELETE CASCADE, so every
-- branch row goes when the Tenant table is dropped. The three branches that
-- existed were test data created while tenancy was being built. User.tenantId is
-- nullable and is dropped outright, which leaves every account unassigned; the
-- login-time check that refused unassigned non-platform users has been removed
-- with the rest of the tenancy code, so sign-in is unaffected.

-- Drop the foreign keys first: MySQL cannot drop a column that a constraint
-- still references, and dropping the Tenant table would cascade the branches away
-- before the Branch column is removed.
ALTER TABLE `User` DROP FOREIGN KEY `User_tenantId_fkey`;
ALTER TABLE `Branch` DROP FOREIGN KEY `Branch_tenantId_fkey`;

ALTER TABLE `Branch` DROP COLUMN `tenantId`;
ALTER TABLE `User` DROP COLUMN `seesAllBranches`;
ALTER TABLE `User` DROP COLUMN `tenantId`;

DROP TABLE `Tenant`;
