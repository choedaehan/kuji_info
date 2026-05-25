-- Add lineup-level prize type such as figure, plush, acrylic stand, etc.
ALTER TABLE `kuji_lineups`
  ADD COLUMN `prizeType` VARCHAR(191) NULL AFTER `prizeName`;
