-- CreateTable
CREATE TABLE `ips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `englishName` VARCHAR(191) NULL,
    `originalName` VARCHAR(191) NULL,
    `officialUrl` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ips_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `officialUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `officialPrice` INTEGER NULL,
    `releaseDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `description` TEXT NULL,
    `goodsType` VARCHAR(191) NULL,
    `officialUrl` VARCHAR(191) NULL,
    `thumbnailImageUrl` VARCHAR(191) NULL,
    `isNotForSale` BOOLEAN NOT NULL DEFAULT false,
    `saleType` ENUM('SINGLE', 'SELECTABLE', 'RANDOM') NOT NULL DEFAULT 'SINGLE',
    `version` INTEGER NULL,
    `companyId` INTEGER NULL,

    INDEX `goods_ipId_idx`(`ipId`),
    INDEX `goods_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goods_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `goodsId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `characterName` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `rarity` VARCHAR(191) NULL,
    `dropRate` DOUBLE NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `goods_items_goodsId_idx`(`goodsId`),
    INDEX `goods_items_name_idx`(`name`),
    INDEX `goods_items_characterName_idx`(`characterName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ip_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `officialUrl` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ip_events_ipId_idx`(`ipId`),
    INDEX `ip_events_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_goods` (
    `eventId` INTEGER NOT NULL,
    `goodsId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_goods_goodsId_idx`(`goodsId`),
    PRIMARY KEY (`eventId`, `goodsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kujis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `japanPricePerTry` INTEGER NULL,
    `koreaPricePerTry` INTEGER NULL,
    `totalCount` INTEGER NULL,
    `japanReleaseDate` DATETIME(3) NULL,
    `koreaReleaseDate` DATETIME(3) NULL,
    `officialUrl` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `kujis_ipId_idx`(`ipId`),
    INDEX `kujis_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kuji_lineups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kujiId` INTEGER NOT NULL,
    `goodsId` INTEGER NULL,
    `prizeName` VARCHAR(191) NULL,
    `prizeType` VARCHAR(191) NULL,
    `grade` VARCHAR(191) NULL,
    `quantity` INTEGER NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `kuji_lineups_kujiId_idx`(`kujiId`),
    INDEX `kuji_lineups_goodsId_idx`(`goodsId`),
    INDEX `kuji_lineups_grade_idx`(`grade`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `goods` ADD CONSTRAINT `goods_ipId_fkey` FOREIGN KEY (`ipId`) REFERENCES `ips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods` ADD CONSTRAINT `goods_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_items` ADD CONSTRAINT `goods_items_goodsId_fkey` FOREIGN KEY (`goodsId`) REFERENCES `goods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ip_events` ADD CONSTRAINT `ip_events_ipId_fkey` FOREIGN KEY (`ipId`) REFERENCES `ips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_goods` ADD CONSTRAINT `event_goods_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `ip_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_goods` ADD CONSTRAINT `event_goods_goodsId_fkey` FOREIGN KEY (`goodsId`) REFERENCES `goods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kujis` ADD CONSTRAINT `kujis_ipId_fkey` FOREIGN KEY (`ipId`) REFERENCES `ips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kuji_lineups` ADD CONSTRAINT `kuji_lineups_kujiId_fkey` FOREIGN KEY (`kujiId`) REFERENCES `kujis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kuji_lineups` ADD CONSTRAINT `kuji_lineups_goodsId_fkey` FOREIGN KEY (`goodsId`) REFERENCES `goods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
