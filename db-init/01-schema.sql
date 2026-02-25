-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Feb 24, 2026 at 02:40 AM
-- Server version: 8.0.45
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gaia_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ConditionHerbs`
--

DROP TABLE IF EXISTS `ConditionHerbs`;
CREATE TABLE IF NOT EXISTS `ConditionHerbs` (
  `conHerbID` int NOT NULL AUTO_INCREMENT,
  `conditionID` int NOT NULL,
  `herbID` int NOT NULL,
  `recommendationLevel` enum('recommended','neutral','avoid','unknown') DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`conHerbID`),
  UNIQUE KEY `uq_conherb_unique` (`conditionID`,`herbID`),
  KEY `fk_conherb_herb` (`herbID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ConditionRecipes`
--

DROP TABLE IF EXISTS `ConditionRecipes`;
CREATE TABLE IF NOT EXISTS `ConditionRecipes` (
  `conRecipeID` int NOT NULL AUTO_INCREMENT,
  `conditionID` int NOT NULL,
  `recipeID` int NOT NULL,
  `notes` text,
  PRIMARY KEY (`conRecipeID`),
  UNIQUE KEY `uq_conrecipe_unique` (`conditionID`,`recipeID`),
  KEY `fk_conrecipe_recipe` (`recipeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Conditions`
--

DROP TABLE IF EXISTS `Conditions`;
CREATE TABLE IF NOT EXISTS `Conditions` (
  `conditionID` int NOT NULL AUTO_INCREMENT,
  `conditionName` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`conditionID`),
  UNIQUE KEY `uq_conditions_name` (`conditionName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ConditionSynonyms`
--

DROP TABLE IF EXISTS `ConditionSynonyms`;
CREATE TABLE IF NOT EXISTS `ConditionSynonyms` (
  `conSynonymID` int NOT NULL AUTO_INCREMENT,
  `conditionID` int NOT NULL,
  `synonym` varchar(255) NOT NULL,
  PRIMARY KEY (`conSynonymID`),
  UNIQUE KEY `uq_consyn_condition_syn` (`conditionID`,`synonym`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Herbs`
--

DROP TABLE IF EXISTS `Herbs`;
CREATE TABLE IF NOT EXISTS `Herbs` (
  `herbID` int NOT NULL AUTO_INCREMENT,
  `herbName` varchar(255) NOT NULL,
  `latinName` varchar(255) DEFAULT NULL,
  `overview` text,
  `usageNotes` text,
  PRIMARY KEY (`herbID`),
  UNIQUE KEY `uq_herbs_latin` (`latinName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `MixtureHerbs`
--

DROP TABLE IF EXISTS `MixtureHerbs`;
CREATE TABLE IF NOT EXISTS `MixtureHerbs` (
  `mixtureHerbID` int NOT NULL AUTO_INCREMENT,
  `mixtureID` int NOT NULL,
  `herbID` int NOT NULL,
  `amount` decimal(8,2) DEFAULT NULL,
  `unit` varchar(30) DEFAULT NULL,
  `role` enum('main','support','optional') DEFAULT NULL,
  PRIMARY KEY (`mixtureHerbID`),
  UNIQUE KEY `uq_mixherb_unique` (`mixtureID`,`herbID`),
  KEY `fk_mixherb_herb` (`herbID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Mixtures`
--

DROP TABLE IF EXISTS `Mixtures`;
CREATE TABLE IF NOT EXISTS `Mixtures` (
  `mixtureID` int NOT NULL AUTO_INCREMENT,
  `mixtureName` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `instructions` text,
  PRIMARY KEY (`mixtureID`),
  UNIQUE KEY `uq_mixtures_name` (`mixtureName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PlanItems`
--

DROP TABLE IF EXISTS `PlanItems`;
CREATE TABLE IF NOT EXISTS `PlanItems` (
  `planItemID` int NOT NULL AUTO_INCREMENT,
  `planID` int NOT NULL,
  `herbID` int DEFAULT NULL,
  `recipeID` int DEFAULT NULL,
  `mixtureID` int DEFAULT NULL,
  `itemType` enum('herb','recipe','mixture') NOT NULL,
  `scheduleHint` varchar(100) DEFAULT NULL,
  `instructions` text,
  `notes` text,
  PRIMARY KEY (`planItemID`),
  KEY `fk_planitems_plan` (`planID`),
  KEY `fk_planitems_herb` (`herbID`),
  KEY `fk_planitems_recipe` (`recipeID`),
  KEY `fk_planitems_mixture` (`mixtureID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Plans`
--

DROP TABLE IF EXISTS `Plans`;
CREATE TABLE IF NOT EXISTS `Plans` (
  `planID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `conditionID` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`planID`),
  KEY `fk_plans_user` (`userID`),
  KEY `fk_plans_condition` (`conditionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Recipes`
--

DROP TABLE IF EXISTS `Recipes`;
CREATE TABLE IF NOT EXISTS `Recipes` (
  `recipeID` int NOT NULL AUTO_INCREMENT,
  `recipeName` varchar(255) NOT NULL,
  `description` text,
  `prepTime` int DEFAULT NULL,
  `dietTags` varchar(255) DEFAULT NULL,
  `notes` text,
  `ingredients` text,
  `instructions` text,
  PRIMARY KEY (`recipeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Reminders`
--

DROP TABLE IF EXISTS `Reminders`;
CREATE TABLE IF NOT EXISTS `Reminders` (
  `reminderID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `planID` int DEFAULT NULL,
  `label` varchar(255) NOT NULL,
  `remindTime` time DEFAULT NULL,
  `dayOfWeek` varchar(20) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`reminderID`),
  KEY `fk_reminders_user` (`userID`),
  KEY `fk_reminders_plan` (`planID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `SafetyNotes`
--

DROP TABLE IF EXISTS `SafetyNotes`;
CREATE TABLE IF NOT EXISTS `SafetyNotes` (
  `safetyNoteID` int NOT NULL AUTO_INCREMENT,
  `herbID` int DEFAULT NULL,
  `mixtureID` int DEFAULT NULL,
  `warningType` enum('contraindication','interaction','allergy','pregnancy','dosage','other') NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL,
  `message` text NOT NULL,
  `instructions` text,
  PRIMARY KEY (`safetyNoteID`),
  KEY `fk_safetynotes_herb` (`herbID`),
  KEY `fk_safetynotes_mixture` (`mixtureID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserPreferences`
--

DROP TABLE IF EXISTS `UserPreferences`;
CREATE TABLE IF NOT EXISTS `UserPreferences` (
  `preferenceID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `dietType` enum('none','vegan','vegetarian','pescatarian','keto','low_carb','gluten_free','dairy_free','halal','kosher','other') DEFAULT NULL,
  `allergies` text,
  `dislikes` text,
  `pregnant` tinyint(1) DEFAULT NULL,
  `medications` tinyint(1) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`preferenceID`),
  UNIQUE KEY `uq_userprefs_user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
CREATE TABLE IF NOT EXISTS `Users` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `userName` varchar(120) DEFAULT NULL,
  `since` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ConditionHerbs`
--
ALTER TABLE `ConditionHerbs`
  ADD CONSTRAINT `fk_conherb_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_conherb_herb` FOREIGN KEY (`herbID`) REFERENCES `Herbs` (`herbID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `ConditionRecipes`
--
ALTER TABLE `ConditionRecipes`
  ADD CONSTRAINT `fk_conrecipe_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_conrecipe_recipe` FOREIGN KEY (`recipeID`) REFERENCES `Recipes` (`recipeID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ConditionSynonyms`
--
ALTER TABLE `ConditionSynonyms`
  ADD CONSTRAINT `fk_consyn_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `MixtureHerbs`
--
ALTER TABLE `MixtureHerbs`
  ADD CONSTRAINT `fk_mixherb_herb` FOREIGN KEY (`herbID`) REFERENCES `Herbs` (`herbID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mixherb_mixture` FOREIGN KEY (`mixtureID`) REFERENCES `Mixtures` (`mixtureID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `PlanItems`
--
ALTER TABLE `PlanItems`
  ADD CONSTRAINT `fk_planitems_herb` FOREIGN KEY (`herbID`) REFERENCES `Herbs` (`herbID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_planitems_mixture` FOREIGN KEY (`mixtureID`) REFERENCES `Mixtures` (`mixtureID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_planitems_plan` FOREIGN KEY (`planID`) REFERENCES `Plans` (`planID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_planitems_recipe` FOREIGN KEY (`recipeID`) REFERENCES `Recipes` (`recipeID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Plans`
--
ALTER TABLE `Plans`
  ADD CONSTRAINT `fk_plans_condition` FOREIGN KEY (`conditionID`) REFERENCES `Conditions` (`conditionID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plans_user` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Reminders`
--
ALTER TABLE `Reminders`
  ADD CONSTRAINT `fk_reminders_plan` FOREIGN KEY (`planID`) REFERENCES `Plans` (`planID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reminders_user` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `SafetyNotes`
--
ALTER TABLE `SafetyNotes`
  ADD CONSTRAINT `fk_safetynotes_herb` FOREIGN KEY (`herbID`) REFERENCES `Herbs` (`herbID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_safetynotes_mixture` FOREIGN KEY (`mixtureID`) REFERENCES `Mixtures` (`mixtureID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserPreferences`
--
ALTER TABLE `UserPreferences`
  ADD CONSTRAINT `fk_userprefs_user` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
