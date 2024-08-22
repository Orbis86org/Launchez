-- DropIndex
DROP INDEX `wallet_addresses_user_id_fkey` ON `wallet_addresses`;

-- AlterTable
ALTER TABLE `wallet_addresses` MODIFY `test_net` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `default` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `wallet_addresses` ADD CONSTRAINT `wallet_addresses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
