/*
  Warnings:

  - Added the required column `completed` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `games_user_id_fkey` ON `games`;

-- DropIndex
DROP INDEX `wallet_addresses_user_id_fkey` ON `wallet_addresses`;

-- AlterTable
ALTER TABLE `games` ADD COLUMN `completed` BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_addresses` ADD CONSTRAINT `wallet_addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
