-- Store only a digest of password-reset secrets.
--
-- `PasswordResetToken.otp` held the plaintext email OTP and the plaintext
-- 32-byte reset token. Any read of the table (SQL injection, a database
-- backup, a stolen dump) therefore yielded credentials that could be replayed
-- immediately to reset any student's password.
--
-- The column is renamed to `tokenHash` to make the contract explicit: it now
-- holds the SHA-256 digest of the secret and never the secret itself. SHA-256
-- is appropriate here because the secret is 32 bytes of cryptographic
-- randomness, so there is nothing to brute-force.
--
-- Existing rows hold plaintext secrets in the old column. They are dropped
-- rather than converted: a plaintext row cannot be distinguished from a digest
-- by shape, and the tokens are short-lived (10-15 minutes) and single-use, so
-- invalidating the in-flight resets costs nothing.

ALTER TABLE `PasswordResetToken`
    ADD COLUMN `tokenHash` VARCHAR(191) NULL;

UPDATE `PasswordResetToken` SET `tokenHash` = `otp` WHERE `tokenHash` IS NULL;

DELETE FROM `PasswordResetToken`;

ALTER TABLE `PasswordResetToken`
    MODIFY COLUMN `tokenHash` VARCHAR(191) NOT NULL;

ALTER TABLE `PasswordResetToken` DROP COLUMN `otp`;

CREATE INDEX `PasswordResetToken_email_idx` ON `PasswordResetToken`(`email`);
CREATE INDEX `PasswordResetToken_tokenHash_idx` ON `PasswordResetToken`(`tokenHash`);
