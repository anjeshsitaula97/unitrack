-- Widen the columns that store JSON payloads.
--
-- Prisma maps a bare `String?` to VARCHAR(191) on MySQL. Several of these
-- columns receive JSON.stringify output from the app, and MySQL truncates
-- silently in non-strict mode, so a student's education history was cut off
-- mid-string at 191 characters. The stored value was then unparseable, and
-- opening the edit form threw "JSON Parse error: Expected '}'".
--
-- LONGTEXT is used rather than TEXT (64KB) because an education history or
-- partner country list has no realistic upper bound, and because a partial
-- write is what caused the corruption in the first place.

ALTER TABLE `Student`
    MODIFY COLUMN `education` LONGTEXT NULL,
    MODIFY COLUMN `workExperience` LONGTEXT NULL,
    MODIFY COLUMN `training` LONGTEXT NULL,
    MODIFY COLUMN `childrenDetails` LONGTEXT NULL,
    MODIFY COLUMN `targetUniversities` LONGTEXT NULL;

ALTER TABLE `Partner`
    MODIFY COLUMN `countries` LONGTEXT NULL;

-- The university and course columns hold JSON lists of the same kind.
ALTER TABLE `University`
    MODIFY COLUMN `accreditation` LONGTEXT NULL,
    MODIFY COLUMN `images` LONGTEXT NULL,
    MODIFY COLUMN `requirements` LONGTEXT NULL;

ALTER TABLE `Course`
    MODIFY COLUMN `prerequisites` LONGTEXT,
    MODIFY COLUMN `quickFilters` LONGTEXT NULL,
    MODIFY COLUMN `requirements` LONGTEXT NULL,
    MODIFY COLUMN `englishTests` LONGTEXT NULL;
