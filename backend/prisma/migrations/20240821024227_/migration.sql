/*
  Warnings:

  - A unique constraint covering the columns `[token_id]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `tokens` ADD COLUMN `bonding_curve_hbar` INTEGER NULL,
    ADD COLUMN `bonding_curve_supply` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `tokens_token_id_key` ON `tokens`(`token_id`);
