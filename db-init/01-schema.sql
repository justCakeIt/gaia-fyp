-- ============================================================
-- G.A.I.A. Database Schema  —  01-schema.sql
-- Run order: 1 of 4
-- Tables only; no data.
-- DROP TABLE guards allow clean rebuilds on Docker volume wipe.
-- ============================================================

USE gaia_db;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Drop all tables (FK checks are off so order is irrelevant)
DROP TABLE IF EXISTS `Reminders`;
DROP TABLE IF EXISTS `PlanItems`;
DROP TABLE IF EXISTS `Plans`;
DROP TABLE IF EXISTS `SafetyNotes`;
DROP TABLE IF EXISTS `ConditionHerbs`;
DROP TABLE IF EXISTS `ConditionRecipes`;
DROP TABLE IF EXISTS `ConditionMixtures`;
DROP TABLE IF EXISTS `ConditionSynonyms`;
DROP TABLE IF EXISTS `MixtureHerbs`;
DROP TABLE IF EXISTS `Mixtures`;
DROP TABLE IF EXISTS `Recipes`;
DROP TABLE IF EXISTS `Herbs`;
DROP TABLE IF EXISTS `Conditions`;
DROP TABLE IF EXISTS `UserPreferences`;
DROP TABLE IF EXISTS `Users`;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Users
-- --------------------------------------------------------
CREATE TABLE `Users` (
  `userID`       int          NOT NULL AUTO_INCREMENT,
  `email`        varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `userName`     varchar(120)          DEFAULT NULL,
  `since`        timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- UserPreferences  (1:1 with Users)
-- --------------------------------------------------------
CREATE TABLE `UserPreferences` (
  `preferenceID` int  NOT NULL AUTO_INCREMENT,
  `userID`       int  NOT NULL,
  `dietType`     enum('none','vegan','vegetarian','pescatarian','keto','low_carb','gluten_free','dairy_free','halal','kosher','other') DEFAULT NULL,
  `allergies`    text,
  `dislikes`     text,
  `pregnant`     tinyint(1)   DEFAULT NULL,
  `medications`  tinyint(1)   DEFAULT NULL,
  `notes`        text,
  PRIMARY KEY (`preferenceID`),
  UNIQUE KEY `uq_userprefs_user` (`userID`),
  CONSTRAINT `fk_userprefs_user` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Conditions
-- --------------------------------------------------------
CREATE TABLE `Conditions` (
  `conditionID`   int          NOT NULL AUTO_INCREMENT,
  `conditionName` varchar(255) NOT NULL,
  `description`   text,
  `category`      varchar(100)          DEFAULT NULL,
  PRIMARY KEY (`conditionID`),
  UNIQUE KEY `uq_conditions_name` (`conditionName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- ConditionSynonyms
-- --------------------------------------------------------
CREATE TABLE `ConditionSynonyms` (
  `conSynonymID` int          NOT NULL AUTO_INCREMENT,
  `conditionID`  int          NOT NULL,
  `synonym`      varchar(255) NOT NULL,
  PRIMARY KEY (`conSynonymID`),
  UNIQUE KEY `uq_consyn_condition_syn` (`conditionID`, `synonym`),
  CONSTRAINT `fk_consyn_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Herbs
-- --------------------------------------------------------
CREATE TABLE `Herbs` (
  `herbID`     int          NOT NULL AUTO_INCREMENT,
  `herbName`   varchar(255) NOT NULL,
  `latinName`  varchar(255)          DEFAULT NULL,
  `overview`   text,
  `usageNotes` text,
  PRIMARY KEY (`herbID`),
  UNIQUE KEY `uq_herbs_latin` (`latinName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Recipes
-- --------------------------------------------------------
CREATE TABLE `Recipes` (
  `recipeID`     int          NOT NULL AUTO_INCREMENT,
  `recipeName`   varchar(255) NOT NULL,
  `description`  text,
  `prepTime`     int                   DEFAULT NULL,
  `dietTags`     varchar(255)          DEFAULT NULL,
  `notes`        text,
  `ingredients`  text,
  `instructions` text,
  PRIMARY KEY (`recipeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Mixtures
-- --------------------------------------------------------
CREATE TABLE `Mixtures` (
  `mixtureID`    int          NOT NULL AUTO_INCREMENT,
  `mixtureName`  varchar(255) NOT NULL,
  `purpose`      varchar(255) NOT NULL,
  `instructions` text,
  `dosage`       text,
  PRIMARY KEY (`mixtureID`),
  UNIQUE KEY `uq_mixtures_name` (`mixtureName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- MixtureHerbs
-- --------------------------------------------------------
CREATE TABLE `MixtureHerbs` (
  `mixtureHerbID` int            NOT NULL AUTO_INCREMENT,
  `mixtureID`     int            NOT NULL,
  `herbID`        int            NOT NULL,
  `amount`        decimal(8,2)            DEFAULT NULL,
  `unit`          varchar(30)             DEFAULT NULL,
  `role`          enum('main','support','optional') DEFAULT NULL,
  PRIMARY KEY (`mixtureHerbID`),
  UNIQUE KEY `uq_mixherb_unique` (`mixtureID`, `herbID`),
  KEY `fk_mixherb_herb` (`herbID`),
  CONSTRAINT `fk_mixherb_mixture` FOREIGN KEY (`mixtureID`) REFERENCES `Mixtures` (`mixtureID`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_mixherb_herb`    FOREIGN KEY (`herbID`)    REFERENCES `Herbs`    (`herbID`)    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- SafetyNotes  (nullable herbID or mixtureID — one or the other)
-- --------------------------------------------------------
CREATE TABLE `SafetyNotes` (
  `safetyNoteID` int  NOT NULL AUTO_INCREMENT,
  `herbID`       int           DEFAULT NULL,
  `mixtureID`    int           DEFAULT NULL,
  `warningType`  enum('contraindication','interaction','allergy','pregnancy','dosage','other') NOT NULL,
  `severity`     enum('low','medium','high','critical') NOT NULL,
  `message`      text NOT NULL,
  `instructions` text,
  PRIMARY KEY (`safetyNoteID`),
  KEY `fk_safetynotes_herb`    (`herbID`),
  KEY `fk_safetynotes_mixture` (`mixtureID`),
  CONSTRAINT `fk_safetynotes_herb`    FOREIGN KEY (`herbID`)    REFERENCES `Herbs`    (`herbID`)    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_safetynotes_mixture` FOREIGN KEY (`mixtureID`) REFERENCES `Mixtures` (`mixtureID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- ConditionHerbs  (links conditions to herbs)
-- --------------------------------------------------------
CREATE TABLE `ConditionHerbs` (
  `conHerbID`           int  NOT NULL AUTO_INCREMENT,
  `conditionID`         int  NOT NULL,
  `herbID`              int  NOT NULL,
  `recommendationLevel` enum('recommended','neutral','avoid','unknown') DEFAULT NULL,
  `notes`               text,
  PRIMARY KEY (`conHerbID`),
  UNIQUE KEY `uq_conherb_unique` (`conditionID`, `herbID`),
  KEY `fk_conherb_herb` (`herbID`),
  CONSTRAINT `fk_conherb_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_conherb_herb`      FOREIGN KEY (`herbID`)      REFERENCES `Herbs`      (`herbID`)      ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- ConditionRecipes  (links conditions to recipes)
-- --------------------------------------------------------
CREATE TABLE `ConditionRecipes` (
  `conRecipeID` int  NOT NULL AUTO_INCREMENT,
  `conditionID` int  NOT NULL,
  `recipeID`    int  NOT NULL,
  `notes`       text,
  PRIMARY KEY (`conRecipeID`),
  UNIQUE KEY `uq_conrecipe_unique` (`conditionID`, `recipeID`),
  KEY `fk_conrecipe_recipe` (`recipeID`),
  CONSTRAINT `fk_conrecipe_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conrecipe_recipe`    FOREIGN KEY (`recipeID`)    REFERENCES `Recipes`    (`recipeID`)    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- ConditionMixtures  (links conditions directly to mixtures)
-- --------------------------------------------------------
CREATE TABLE `ConditionMixtures` (
  `conMixtureID` int NOT NULL AUTO_INCREMENT,
  `conditionID`  int NOT NULL,
  `mixtureID`    int NOT NULL,
  PRIMARY KEY (`conMixtureID`),
  UNIQUE KEY `uq_conmix_unique` (`conditionID`, `mixtureID`),
  KEY `fk_conmix_mixture` (`mixtureID`),
  CONSTRAINT `fk_conmix_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conmix_mixture`   FOREIGN KEY (`mixtureID`)   REFERENCES `Mixtures`   (`mixtureID`)   ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Plans  (user wellness plans)
-- --------------------------------------------------------
CREATE TABLE `Plans` (
  `planID`      int          NOT NULL AUTO_INCREMENT,
  `userID`      int          NOT NULL,
  `conditionID` int                   DEFAULT NULL,
  `title`       varchar(255) NOT NULL,
  PRIMARY KEY (`planID`),
  KEY `fk_plans_user`      (`userID`),
  KEY `fk_plans_condition` (`conditionID`),
  CONSTRAINT `fk_plans_user`      FOREIGN KEY (`userID`)      REFERENCES `Users`      (`userID`)      ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_plans_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- PlanItems
-- --------------------------------------------------------
CREATE TABLE `PlanItems` (
  `planItemID`   int                              NOT NULL AUTO_INCREMENT,
  `planID`       int                              NOT NULL,
  `herbID`       int                                       DEFAULT NULL,
  `recipeID`     int                                       DEFAULT NULL,
  `mixtureID`    int                                       DEFAULT NULL,
  `itemType`     enum('herb','recipe','mixture')  NOT NULL,
  `scheduleHint` varchar(100)                              DEFAULT NULL,
  `instructions` text,
  `notes`        text,
  PRIMARY KEY (`planItemID`),
  KEY `fk_planitems_plan`    (`planID`),
  KEY `fk_planitems_herb`    (`herbID`),
  KEY `fk_planitems_recipe`  (`recipeID`),
  KEY `fk_planitems_mixture` (`mixtureID`),
  CONSTRAINT `fk_planitems_plan`    FOREIGN KEY (`planID`)    REFERENCES `Plans`    (`planID`)    ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_planitems_herb`    FOREIGN KEY (`herbID`)    REFERENCES `Herbs`    (`herbID`)    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_planitems_recipe`  FOREIGN KEY (`recipeID`)  REFERENCES `Recipes`  (`recipeID`)  ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_planitems_mixture` FOREIGN KEY (`mixtureID`) REFERENCES `Mixtures` (`mixtureID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Reminders
-- --------------------------------------------------------
CREATE TABLE `Reminders` (
  `reminderID` int          NOT NULL AUTO_INCREMENT,
  `userID`     int          NOT NULL,
  `planID`     int                   DEFAULT NULL,
  `label`      varchar(255) NOT NULL,
  `remindTime` time                  DEFAULT NULL,
  `dayOfWeek`  varchar(20)           DEFAULT NULL,
  `enabled`    tinyint(1)            DEFAULT NULL,
  PRIMARY KEY (`reminderID`),
  KEY `fk_reminders_user` (`userID`),
  KEY `fk_reminders_plan` (`planID`),
  CONSTRAINT `fk_reminders_user` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_reminders_plan` FOREIGN KEY (`planID`) REFERENCES `Plans` (`planID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
