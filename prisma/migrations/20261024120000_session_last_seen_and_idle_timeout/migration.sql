-- Single-session enforcement and inactivity auto-logout.
--
-- The account rows already store which session id is allowed to act, but nothing
-- recorded when that session last did anything. Without a timestamp the server
-- can neither answer "is this account signed in elsewhere right now?" nor expire
-- an abandoned session, which currently survives for the whole 12h token
-- lifetime. Both columns are nullable, so an existing session simply has no
-- recorded activity yet and is treated as inactive rather than locked out.

-- AlterTable
ALTER TABLE `User` ADD COLUMN `activeSessionLastSeenAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `activeSessionLastSeenAt` DATETIME(3) NULL;

-- Minutes of inactivity before a session is logged out. The value lives on the
-- platform row (consultancyId IS NULL) and applies to every consultancy, so the
-- default lands on existing rows too and no back-fill is needed.
ALTER TABLE `SystemSettings` ADD COLUMN `sessionIdleTimeoutMinutes` INTEGER NOT NULL DEFAULT 15;
