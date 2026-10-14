-- AlterTable
ALTER TABLE `Course` ADD COLUMN `tuitionFeePeriod` VARCHAR(191) NULL DEFAULT 'Year',
    ADD COLUMN `englishTestStage` VARCHAR(191) NULL DEFAULT 'Before Application';
