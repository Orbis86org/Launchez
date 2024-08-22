-- DropIndex
DROP INDEX `games_user_id_fkey` ON `games`;

-- DropIndex
DROP INDEX `wallet_addresses_user_id_fkey` ON `wallet_addresses`;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_addresses` ADD CONSTRAINT `wallet_addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
