/*
  Warnings:

  - You are about to drop the `trades` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Replies_thread_id_fkey` ON `replies`;

-- DropTable
DROP TABLE `trades`;

-- CreateTable
CREATE TABLE `Trade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_id` INTEGER NOT NULL,
    `wallet_address` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Replies` ADD CONSTRAINT `Replies_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `Threads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trade` ADD CONSTRAINT `Trade_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `tokens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
