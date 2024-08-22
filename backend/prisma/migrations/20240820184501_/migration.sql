/*
  Warnings:

  - You are about to drop the `games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_addresses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `games`;

-- DropTable
DROP TABLE `users`;

-- DropTable
DROP TABLE `wallet_addresses`;

-- CreateTable
CREATE TABLE `tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `token_id` VARCHAR(191) NULL,
    `wallet_address` VARCHAR(191) NULL,
    `hashscan_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
