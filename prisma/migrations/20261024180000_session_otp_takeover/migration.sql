-- Email-OTP session takeover for the "already logged in elsewhere" refusal.
--
-- A refused sign-in currently has two exits: wait for the inactivity window, or
-- ask an Admin to release the session. This adds a third that the account owner
-- can use alone: prove control of the registered mailbox with a short-lived
-- code, then sign in here and supersede the other location.
--
-- The codes live in their own table rather than PasswordResetToken on purpose.
-- PasswordResetToken is walked by /api/auth/verify-otp, which turns any unverified
-- row it finds into a 15-minute password-reset token, so a session code stored
-- there would let someone who only owns a mailbox change a password. Keeping the
-- purposes in separate tables means a code can only ever be spent on the flow
-- that issued it.

-- CreateTable
CREATE TABLE `SessionOtpToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consultancyId` INTEGER NULL,
    `subject` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SessionOtpToken_consultancyId_idx`(`consultancyId`),
    INDEX `SessionOtpToken_subject_email_idx`(`subject`, `email`),
    INDEX `SessionOtpToken_tokenHash_idx`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Whether that self-service exit is offered at all. The decision is platform
-- wide (read from the SystemSettings row where consultancyId IS NULL) and the
-- default is on, so an upgrade does not silently remove a relief route people
-- already relied on; a Super Admin can turn it off to force the Admin-only path.
ALTER TABLE `SystemSettings` ADD COLUMN `sessionOtpTakeoverEnabled` BOOLEAN NOT NULL DEFAULT true;
