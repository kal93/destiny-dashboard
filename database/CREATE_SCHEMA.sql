CREATE DATABASE  IF NOT EXISTS `destiny_dashboard` ;
USE `destiny_dashboard`;


DROP TABLE IF EXISTS `dashboard_cards`;
CREATE TABLE `dashboard_cards` (
  `dashboard_id` bigint(20) NOT NULL,
  `sequence` smallint(6) NOT NULL,
  `definition_id` smallint(6) NOT NULL,
  `layout_id` smallint(6) NOT NULL,
  PRIMARY KEY (`dashboard_id`,`sequence`),
  KEY `IX_DASHBOARD_ID` (`dashboard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `token`;
CREATE TABLE `token` (
  `membership_id` bigint(20) NOT NULL,
  `access_token` varchar(400) NOT NULL,
  `refresh_token` varchar(400) NOT NULL,
  `expires` datetime NOT NULL,
  `updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `IX_ACCESS_TOKEN` (`access_token`(255)),
  KEY `IX_EXPIRES` (`expires`),
  KEY `IX_MEMBERSHIP_ID` (`membership_id`),
  KEY `IX_UPDATED` (`updated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `user_dashboard`;
CREATE TABLE `user_dashboard` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `membership_id` bigint(20) DEFAULT NULL,
  `name` varchar(24) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_MEMBERSHIP_ID` (`membership_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE `user_preferences` (
  `membership_id` bigint(20) NOT NULL,
  `membership_index` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`membership_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `meta`;
CREATE TABLE `meta` (
  `version` int NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `meta` SET `version` = 1;