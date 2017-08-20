
-- This script will automatically upgrade any database version to the most current version
DELIMITER $$

DROP PROCEDURE UpgradeDatabase; $$

CREATE PROCEDURE UpgradeDatabase ()
BEGIN
  SELECT version FROM meta INTO @version; 
   IF @version < 2 THEN
      SELECT 'Upgrading to v2' AS '';

   END IF;

  UPDATE meta SET version = 2;

END; $$


CALL UpgradeDatabase(); $$
