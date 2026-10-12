-- CreateTable
CREATE TABLE `StudentNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `content` LONGTEXT NOT NULL,
    `authorType` VARCHAR(191) NOT NULL DEFAULT 'staff',
    `authorName` VARCHAR(191) NOT NULL DEFAULT '',
    `authorRole` VARCHAR(191) NULL,
    `authorId` INTEGER NULL,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentNote_studentId_idx`(`studentId`),
    INDEX `StudentNote_parentId_idx`(`parentId`),
    INDEX `StudentNote_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentNote` ADD CONSTRAINT `StudentNote_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `StudentNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentNote` ADD CONSTRAINT `StudentNote_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;