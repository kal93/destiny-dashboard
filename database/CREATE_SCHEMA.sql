CREATE DATABASE  IF NOT EXISTS `destiny_dashboard` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `destiny_dashboard`;
-- Server version 5.5.50


DROP TABLE IF EXISTS `meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meta` (
  `version` int(11) NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `token` (
  `membership_id` bigint(20) NOT NULL,
  `access_token` varchar(400) DEFAULT NULL,
  `refresh_token` varchar(400) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `IX_EXPIRES` (`expires`),
  KEY `IX_MEMBERSHIP_ID` (`membership_id`),
  KEY `IX_UPDATED` (`updated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `user_dashboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_dashboard` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `membership_id` bigint(20) DEFAULT NULL,
  `name` varchar(24) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_MEMBERSHIP_ID` (`membership_id`)
) ENGINE=InnoDB AUTO_INCREMENT=545 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_dashboard_cards` (
  `dashboard_id` bigint(20) NOT NULL,
  `sequence` smallint(6) NOT NULL,
  `definition_id` smallint(6) DEFAULT NULL,
  `layout_id` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`dashboard_id`,`sequence`),
  KEY `IX_DASHBOARD_ID` (`dashboard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `user_loadouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_loadouts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `membership_id` bigint(20) DEFAULT NULL,
  `membership_type` smallint(6) DEFAULT NULL,
  `name` varchar(16) DEFAULT NULL,
  `item_ids` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_MEMBERSHIP_ID_MEMBERSHIP_TYPE` (`membership_id`, `membership_type`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_preferences` (
  `membership_id` bigint(20) NOT NULL,
  `membership_index` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`membership_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Dump completed on 2017-09-03 22:19:50
