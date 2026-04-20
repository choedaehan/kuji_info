-- CreateTable
CREATE TABLE `ip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ip_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kuji_series` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `totalCellCount` INTEGER NOT NULL,
    `releaseDate` DATETIME(3) NOT NULL,
    `officialUrl` VARCHAR(191) NOT NULL,
    `thumbnailImageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `kuji_series_ipId_idx`(`ipId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kuji_prize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kujiSeriesId` INTEGER NOT NULL,
    `grade` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,
    `thumbnailImageUrl` VARCHAR(191) NOT NULL,
    `totalCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `kuji_prize_kujiSeriesId_idx`(`kujiSeriesId`),
    INDEX `kuji_prize_grade_idx`(`grade`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kuji_observation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kujiSeriesId` INTEGER NOT NULL,
    `setId` VARCHAR(191) NOT NULL,
    `totalCellCount` INTEGER NOT NULL,
    `grade` VARCHAR(191) NOT NULL,
    `row` INTEGER NOT NULL,
    `col` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `kuji_observation_kujiSeriesId_idx`(`kujiSeriesId`),
    INDEX `kuji_observation_setId_idx`(`setId`),
    INDEX `kuji_observation_grade_idx`(`grade`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kuji_series` ADD CONSTRAINT `kuji_series_ipId_fkey` FOREIGN KEY (`ipId`) REFERENCES `ip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kuji_prize` ADD CONSTRAINT `kuji_prize_kujiSeriesId_fkey` FOREIGN KEY (`kujiSeriesId`) REFERENCES `kuji_series`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kuji_observation` ADD CONSTRAINT `kuji_observation_kujiSeriesId_fkey` FOREIGN KEY (`kujiSeriesId`) REFERENCES `kuji_series`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
