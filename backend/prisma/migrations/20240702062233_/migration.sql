/*
  Warnings:

  - A unique constraint covering the columns `[discord_user_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `games_user_id_fkey` ON `games`;

-- DropIndex
DROP INDEX `wallet_addresses_user_id_fkey` ON `wallet_addresses`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `discord_user_name` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_discord_user_name_key` ON `users`(`discord_user_name`);

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_addresses` ADD CONSTRAINT `wallet_addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
