-- AlterTable
ALTER TABLE `tokens` ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `liquidity_pool_link` VARCHAR(191) NULL,
    ADD COLUMN `memo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Threads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Replies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thread_id` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Replies` ADD CONSTRAINT `Replies_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `Threads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
