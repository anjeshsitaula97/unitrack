-- AlterTable
ALTER TABLE `User` ADD COLUMN `activeSessionAt` DATETIME(3) NULL,
    ADD COLUMN `activeSessionId` VARCHAR(191) NULL,
    ADD COLUMN `activeSessionIp` VARCHAR(191) NULL,
    ADD COLUMN `activeSessionUserAgent` VARCHAR(191) NULL;
