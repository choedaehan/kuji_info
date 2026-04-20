/*
  Warnings:

  - Added the required column `price` to the `kuji_prize` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kuji_prize` ADD COLUMN `price` INTEGER NOT NULL;
