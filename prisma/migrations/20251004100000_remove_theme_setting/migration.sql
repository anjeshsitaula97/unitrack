-- Remove the persisted theme setting.
--
-- Night mode is being removed from the app entirely: the ThemeProvider, the
-- Topbar toggle, the "Theme Mode" dropdown in Settings and every `dark:`
-- Tailwind variant are gone. The setting was already dead at runtime, because
-- the provider only ever read `localStorage` while this column was written by
-- the settings form.
--
-- Schema drift: no migration ever created `SystemSettings.theme`. It exists on
-- the live database because the schema was pushed with `prisma db push` at
-- some point, so a plain `DROP COLUMN` would succeed there but fail on any
-- database built purely from migrations. The host runs MariaDB 11.8, which
-- supports `DROP COLUMN IF EXISTS`, so this one statement is correct for both
-- the drifted production database and a fresh migration-only install.
--
-- DESTRUCTIVE: drops a column, but it only ever held the value "light" and
-- nothing reads it any more.

ALTER TABLE `SystemSettings` DROP COLUMN IF EXISTS `theme`;