-- Decimal credits and a refundable deposit fee.
--
-- `credits` was an INT, which silently truncated a fractional credit value
-- (e.g. 22.5 credits became 22). DECIMAL(6,2) stores the value exactly while
-- still surfacing it as a plain JavaScript number through Prisma, so no
-- consumer needs to change how it reads the field.
--
-- A deposit fee is the amount payable on enrolment, which is distinct from
-- the application fee. It carries its own currency and a flag saying whether
-- the money is returned to the student.

ALTER TABLE `Course`
    MODIFY COLUMN `credits` DECIMAL(6,2) NOT NULL;

ALTER TABLE `Course`
    ADD COLUMN `depositFee` VARCHAR(191) NULL,
    ADD COLUMN `depositFeeCurrency` VARCHAR(191) NULL,
    ADD COLUMN `depositFeeRefundable` BOOLEAN NOT NULL DEFAULT FALSE;
