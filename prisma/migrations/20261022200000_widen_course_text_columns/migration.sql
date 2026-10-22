-- Widen the remaining course text columns.
--
-- The 20251002120000_widen_json_columns migration widened the JSON payload
-- columns but left three course columns on VARCHAR(191):
--
--   * `intake` stores JSON.stringify output of the intake list. A course with
--     two or more intakes exceeds 191 characters, and MySQL truncated the value
--     silently, leaving unparseable JSON behind. The second intake was lost.
--   * `description` is free-text course copy and was cut off at 191 characters.
--   * `academicRequirement` is free-text admission criteria and was cut off at
--     191 characters as well.
--
-- LONGTEXT is used for the same reason as the earlier migration: a partial
-- write is what caused the corruption in the first place.

ALTER TABLE `Course`
    MODIFY COLUMN `intake` LONGTEXT NULL,
    MODIFY COLUMN `description` LONGTEXT,
    MODIFY COLUMN `academicRequirement` LONGTEXT NULL;
