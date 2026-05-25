-- Kuji lineups can be created before goods are connected, so goodsId can be NULL.
-- The previous compound unique key does not match this lifecycle and can block
-- lineup-first editing depending on database behavior.
DROP INDEX `kuji_lineups_kujiId_goodsId_key` ON `kuji_lineups`;
