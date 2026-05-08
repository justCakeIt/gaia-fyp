-- ============================================================
-- G.A.I.A. Relation Seed Data  —  03-seed-relations.sql
-- Run order: 3 of 4
-- Junction tables linking Conditions → Herbs, Recipes, Mixtures.
-- Must run AFTER 02-seed-core.sql.
-- ============================================================

USE gaia_db;

START TRANSACTION;

-- ------------------------------------------------------------
-- CONDITION HERBS
-- recommendationLevel: recommended | neutral | avoid | unknown
-- ------------------------------------------------------------
INSERT INTO ConditionHerbs (conHerbID, conditionID, herbID, recommendationLevel, notes)
VALUES
-- MASLD / Fatty Liver (conditionID = 1)
(1,  1,  1,  'recommended', 'Hepatoprotective silymarin complex. Supportive use only; discuss with clinician if on CYP-metabolised medication.'),
(2,  1,  2,  'recommended', 'Choleretic action supports bile flow and liver detox pathways. Emerging evidence in lipid and liver enzyme reduction.'),
(3,  1,  3,  'recommended', 'Digestive bitter supporting bile production. Mild diuretic effect — maintain hydration.'),
(4,  1,  4,  'recommended', 'Anti-inflammatory at culinary and tea doses. Caution with anticoagulants at high supplemental doses.'),
(5,  1,  8,  'neutral',     'Antioxidant catechins (EGCG). Caffeine consideration — avoid late in the day. Do not use high-dose extracts.'),
(6,  1, 13,  'recommended', 'Curcumin reduces hepatic inflammation and oxidative stress. Use with black pepper to enhance absorption.'),
(7,  1, 14,  'avoid',       'Hepatotoxic — associated with acute liver failure. Strictly contraindicated in MASLD.'),

-- Type 2 Diabetes (conditionID = 2)
(8,  2,  9,  'neutral',     'Cinnamon in culinary amounts; not a replacement for care.'),
(9,  2, 10,  'neutral',     'May affect blood sugar; caution with glucose-lowering medication.'),
(10, 2,  8,  'neutral',     'Caffeine beverage; watch sleep/stress and hydration.'),

-- IBS (conditionID = 3)
(11, 3,  5,  'recommended', 'Peppermint sometimes helps comfort; may worsen reflux.'),
(12, 3,  4,  'neutral',     'Ginger can support digestion; tolerance varies.'),
(13, 3,  6,  'neutral',     'Calming routine may help stress-related digestion.'),

-- Hypertension (conditionID = 4)
(14, 4, 11,  'recommended', 'Heart-friendly diet pattern component (culinary use).'),
(15, 4, 12,  'avoid',       'Potential interactions with heart meds; consult if on prescriptions.'),

-- Stress / Mild Anxiety (conditionID = 5)
(16, 5,  6,  'recommended', 'Calming tea routine; avoid allergens.'),
(17, 5,  7,  'recommended', 'May cause drowsiness; supportive only.');

-- ------------------------------------------------------------
-- CONDITION RECIPES
-- ------------------------------------------------------------
INSERT INTO ConditionRecipes (conRecipeID, conditionID, recipeID, notes)
VALUES
-- MASLD / Fatty Liver (condition-specific recipes only)
(1,  1, 11, 'Anti-inflammatory breakfast; curcumin + fibre for liver support.'),
(2,  1, 12, 'Omega-3 rich main; oily fish recommended twice weekly in MASLD.'),
(3,  1, 13, 'Plant-based, fibre-rich bowl; artichoke supports bile production.'),
(4,  1, 14, 'Antioxidant-dense grain bowl; curcumin, beta-carotene, healthy fats.'),
(5,  1, 15, 'Bitter-leaf salad; dandelion supports digestive function and liver pathways.'),

-- Type 2 Diabetes
(6,  2,  2, 'Fibre-focused breakfast; portion control recommended.'),
(7,  2,  4, 'Lower sugar option; supportive only.'),
(8,  2,  6, 'Balanced plate helps routine consistency.'),

-- IBS
(9,  3,  7, 'Gentle meal option; adjust ingredients to tolerance.'),
(10, 3,  3, 'Digestive tea; discontinue if sensitive.'),
(11, 3,  8, 'Calming non-caffeinated evening routine.'),

-- Hypertension
(12, 4,  9, 'Plant protein meal; adjust garlic to preference/tolerance.'),
(13, 4,  6, 'Balanced plate; reduce salt and processed foods.'),

-- Stress / Mild Anxiety
(14, 5,  8, 'Evening tea routine; calming habit.'),
(15, 5, 10, 'Caffeine earlier in day only; avoid evening.');

-- ------------------------------------------------------------
-- CONDITION MIXTURES
-- Direct condition → mixture links (no indirect herb-join needed)
-- ------------------------------------------------------------
INSERT INTO ConditionMixtures (conditionID, mixtureID) VALUES
(3, 1), -- IBS         → Digestive Support Blend
(5, 2), -- Stress      → Evening Calm Blend
(2, 3), -- T2D         → Metabolic Routine Blend
(4, 4), -- Hypertension→ Heart-Friendly Herbal Tea
(1, 5), -- MASLD       → Liver Support Infusion
(1, 6), -- MASLD       → Anti-inflammatory Herbal Blend
(1, 7), -- MASLD       → Digestive Bitter Tonic
(1, 8); -- MASLD       → Hepatic Support Elixir

COMMIT;
