USE gaia_db;

START TRANSACTION;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
INSERT INTO Users (userID, email, passwordHash, userName) VALUES
(1, 'michal@example.com',  '$2b$10$demo.hash.only', 'Michal'),
(2, 'adam@example.com', '$2b$10$demo.hash.only', 'Adam'),
(3, 'alex@example.com',  '$2b$10$demo.hash.only', 'Alex');

-- ------------------------------------------------------------
-- USER PREFERENCES (1:1 unique on userID)
-- dietType enum('none','vegan','vegetarian','pescatarian','keto','low_carb','gluten_free','dairy_free','halal','kosher','other')
-- ------------------------------------------------------------
INSERT INTO UserPreferences
(preferenceID, userID, dietType, allergies, dislikes, pregnant, medications, notes)
VALUES
(1, 1, 'none',        'none',            'shellfish', 0, 0, 'Prefers short prep time and simple plans.'),
(2, 2, 'vegetarian',  'nuts',            'very spicy', 0, 1, 'Takes prescription medication; highlight interactions.'),
(3, 3, 'low_carb',    'lactose',         'sugary snacks', 0, 0, 'Wants routine-based meal structure; no extreme dieting.');

-- ------------------------------------------------------------
-- CONDITIONS
-- ------------------------------------------------------------
INSERT INTO Conditions (conditionID, conditionName, description, category) VALUES
(1, 'Fatty Liver (MASLD)', 'Supportive lifestyle + nutrition guidance after confirmed diagnosis. Not diagnostic.', 'Liver'),
(2, 'Type 2 Diabetes', 'Supportive meal planning and routine habits for diagnosed users. Not medical advice.', 'Metabolic'),
(3, 'IBS', 'Supportive digestion-focused guidance. Not a diagnostic tool.', 'Digestive'),
(4, 'Hypertension (High Blood Pressure)', 'Supportive lifestyle routines (diet, sleep, activity). Not medical advice.', 'Cardiovascular'),
(5, 'Stress / Mild Anxiety', 'Supportive wellbeing habits (sleep routine, calming practices). Not medical advice.', 'Wellbeing');

-- ------------------------------------------------------------
-- CONDITION SYNONYMS (unique (conditionID, synonym))
-- ------------------------------------------------------------
INSERT INTO ConditionSynonyms (conSynonymID, conditionID, synonym) VALUES
(1, 1, 'fatty liver'),
(2, 1, 'nafld'),
(3, 1, 'masld'),
(4, 1, 'liver fat'),

(5, 2, 't2d'),
(6, 2, 'type two diabetes'),
(7, 2, 'diabetes type 2'),

(8, 3, 'ibs'),
(9, 3, 'irritable bowel syndrome'),
(10, 3, 'gut sensitivity'),

(11, 4, 'high blood pressure'),
(12, 4, 'hypertension'),

(13, 5, 'stress'),
(14, 5, 'anxiety');

-- ------------------------------------------------------------
-- HERBS (latinName UNIQUE; NULL allowed but UNIQUE on NULL is fine in MySQL)
-- ------------------------------------------------------------
INSERT INTO Herbs (herbID, herbName, latinName, overview, usageNotes) VALUES
(1,  'Milk thistle',    'Silybum marianum',          'Traditionally used for liver support; evidence varies.', 'Supportive use only; do not replace prescribed care.'),
(2,  'Artichoke leaf',  'Cynara scolymus',           'Traditionally used in digestion routines.',              'Avoid if bile duct obstruction; consult if unsure.'),
(3,  'Dandelion',       'Taraxacum officinale',      'Traditionally used for digestion/appetite routines.',    'May interact with diuretics; consult if on medication.'),
(4,  'Ginger',          'Zingiber officinale',       'Used for digestive comfort and nausea support.',         'Caution with anticoagulants at high supplemental doses.'),
(5,  'Peppermint',      'Mentha x piperita',         'Often used for digestive comfort.',                      'May worsen reflux in some users.'),
(6,  'Chamomile',       'Matricaria chamomilla',     'Traditionally used for relaxation and sleep support.',   'Avoid if allergic to ragweed family plants.'),
(7,  'Lemon balm',      'Melissa officinalis',       'Traditionally used for calm/sleep routines.',            'May cause drowsiness; avoid before driving if affected.'),
(8,  'Green tea',       'Camellia sinensis',         'Common beverage in routines; contains caffeine.',        'Avoid late evening; reduce if caffeine-sensitive.'),
(9,  'Cinnamon',        'Cinnamomum verum',          'Common culinary spice; discussed in metabolic support.', 'Prefer culinary amounts; supplements require caution.'),
(10, 'Fenugreek',       'Trigonella foenum-graecum', 'Traditionally used in metabolic routines.',              'May lower blood sugar; caution with diabetes meds.'),
(11, 'Garlic',          'Allium sativum',            'Food ingredient used in heart-friendly diet patterns.',  'High supplemental doses may increase bleeding risk.'),
(12, 'Hawthorn',        'Crataegus monogyna',        'Traditionally used for cardiovascular wellbeing.',       'Potential interactions with heart/blood pressure medication.');

-- ------------------------------------------------------------
-- RECIPES
-- NOTE: Recipes table has a `notes` column (your schema), so we fill it.
-- ------------------------------------------------------------
INSERT INTO Recipes
(recipeID, recipeName, description, prepTime, dietTags, notes, ingredients, instructions)
VALUES
(1,  'Mediterranean Salad Bowl', 'High fibre + healthy fats; simple meal idea.', 15, 'mediterranean,high-fibre', 'Use olive oil + lemon; keep portions balanced.', 'lettuce,tomato,cucumber,olive oil,lemon,olives', 'Mix ingredients; dress with olive oil and lemon.'),
(2,  'Oatmeal with Berries', 'Fibre-focused breakfast option.', 10, 'high-fibre,low-sugar', 'Avoid added sugar; adjust portion size.', 'oats,berries,water,cinnamon', 'Cook oats; top with berries and a small amount of cinnamon.'),
(3,  'Simple Ginger Tea', 'Warm drink using fresh ginger.', 8, 'digestive', 'Stop if irritation occurs.', 'ginger,water', 'Simmer sliced ginger 5–8 minutes; strain and serve.'),
(4,  'Low-Sugar Yogurt Bowl', 'Protein + fibre snack/meal idea.', 7, 'low-sugar', 'Choose unsweetened yogurt.', 'plain yogurt,berries,chia seeds', 'Combine ingredients; adjust portion size to preference.'),
(5,  'Grilled Veg Plate', 'Vegetable-focused meal with olive oil.', 25, 'vegetarian,mediterranean', 'Use herbs instead of extra salt.', 'courgette,pepper,onion,olive oil,herbs', 'Grill vegetables; add olive oil and herbs.'),
(6,  'Balanced Plate (Protein + Greens)', 'Simple balanced meal layout.', 20, 'balanced', 'Keep processed foods low; watch salt.', 'chicken/tofu,leafy greens,olive oil', 'Cook protein; serve with greens and olive oil.'),
(7,  'Gentle Rice Bowl', 'Simple meal idea for sensitive digestion.', 20, 'gentle', 'Adjust ingredients to tolerance.', 'rice,carrot,courgette,olive oil', 'Cook rice; sauté vegetables gently; combine.'),
(8,  'Chamomile Evening Tea', 'Non-caffeinated evening drink routine.', 5, 'sleep', 'Avoid if ragweed allergy.', 'chamomile tea bag,water', 'Steep 3–5 minutes.'),
(9,  'Garlic-Lemon Chickpea Salad', 'Plant protein + fibre meal.', 12, 'vegetarian,high-fibre', 'Reduce garlic if sensitive.', 'chickpeas,lemon,garlic,olive oil,parsley', 'Mix ingredients; adjust garlic to tolerance.'),
(10, 'Green Tea Routine', 'Caffeine drink to use earlier in day.', 5, 'routine', 'Avoid late evening; hydrate.', 'green tea bag,water', 'Steep 2–3 minutes; avoid late evening.');

-- ------------------------------------------------------------
-- MIXTURES
-- ------------------------------------------------------------
INSERT INTO Mixtures (mixtureID, mixtureName, purpose, instructions) VALUES
(1, 'Digestive Support Blend', 'Digestive comfort support', 'Use as a tea blend; start small and discontinue if symptoms worsen.'),
(2, 'Evening Calm Blend', 'Relaxation / sleep routine support', 'Use as evening tea. Avoid if allergic to components.'),
(3, 'Metabolic Routine Blend', 'Routine support for balanced eating habits', 'Supportive routine only. Not a treatment.'),
(4, 'Heart-Friendly Herbal Tea', 'Cardiovascular wellbeing support', 'Consult professional if taking heart/blood pressure medication.');

-- ------------------------------------------------------------
-- MIXTURE HERBS (unique (mixtureID, herbID))
-- role enum('main','support','optional')
-- ------------------------------------------------------------
INSERT INTO MixtureHerbs
(mixtureHerbID, mixtureID, herbID, amount, unit, role)
VALUES
(1, 1, 5,  1.00, 'tsp', 'main'),     -- peppermint
(2, 1, 4,  0.50, 'tsp', 'support'),  -- ginger

(3, 2, 6,  1.00, 'tsp', 'main'),     -- chamomile
(4, 2, 7,  0.50, 'tsp', 'support'),  -- lemon balm

(5, 3, 9,  0.50, 'tsp', 'main'),     -- cinnamon
(6, 3, 10, 0.50, 'tsp', 'support'),  -- fenugreek

(7, 4, 12, 0.50, 'tsp', 'main'),     -- hawthorn
(8, 4, 8,  0.50, 'tsp', 'support');  -- green tea

-- ------------------------------------------------------------
-- CONDITION HERBS (unique (conditionID, herbID))
-- recommendationLevel enum('recommended','neutral','avoid','unknown')
-- ------------------------------------------------------------
INSERT INTO ConditionHerbs
(conHerbID, conditionID, herbID, recommendationLevel, notes)
VALUES
-- MASLD / Fatty Liver
(1, 1, 1,  'recommended', 'Often suggested for liver routines; evidence mixed; supportive use only.'),
(2, 1, 2,  'neutral',     'Supportive digestion routine; not a treatment.'),
(3, 1, 8,  'neutral',     'Green tea routine earlier in day; caffeine considerations.'),

-- Type 2 Diabetes
(4, 2, 9,  'neutral',     'Cinnamon in culinary amounts; not a replacement for care.'),
(5, 2, 10, 'neutral',     'May affect blood sugar; caution with glucose-lowering medication.'),
(6, 2, 8,  'neutral',     'Caffeine beverage; watch sleep/stress and hydration.'),

-- IBS
(7, 3, 5,  'recommended', 'Peppermint sometimes helps comfort; may worsen reflux.'),
(8, 3, 4,  'neutral',     'Ginger can support digestion; tolerance varies.'),
(9, 3, 6,  'neutral',     'Calming routine may help stress-related digestion.'),

-- Hypertension
(10,4, 11, 'recommended', 'Heart-friendly diet pattern component (culinary use).'),
(11,4, 12, 'avoid',       'Potential interactions with heart meds; consult if on prescriptions.'),

-- Stress / Anxiety
(12,5, 6,  'recommended', 'Calming tea routine; avoid allergens.'),
(13,5, 7,  'recommended', 'May cause drowsiness; supportive only.');

-- ------------------------------------------------------------
-- CONDITION RECIPES (unique (conditionID, recipeID))
-- ------------------------------------------------------------
INSERT INTO ConditionRecipes
(conRecipeID, conditionID, recipeID, notes)
VALUES
-- MASLD / Fatty Liver
(1,  1, 1,  'Mediterranean-style meal suggestion for supportive lifestyle routines.'),
(2,  1, 5,  'Vegetable-focused meal; supports weight management habits.'),
(3,  1, 6,  'Balanced plate concept; supportive only.'),

-- Type 2 Diabetes
(4,  2, 2,  'Fibre-focused breakfast; portion control recommended.'),
(5,  2, 4,  'Lower sugar option; supportive only.'),
(6,  2, 6,  'Balanced plate helps routine consistency.'),

-- IBS
(7,  3, 7,  'Gentle meal option; adjust ingredients to tolerance.'),
(8,  3, 3,  'Digestive tea; discontinue if sensitive.'),
(9,  3, 8,  'Calming non-caffeinated evening routine.'),

-- Hypertension
(10, 4, 9,  'Plant protein meal; adjust garlic to preference/tolerance.'),
(11, 4, 6,  'Balanced plate; reduce salt and processed foods.'),

-- Stress / Anxiety
(12, 5, 8,  'Evening tea routine; calming habit.'),
(13, 5, 10, 'Caffeine earlier in day only; avoid evening.');

-- ------------------------------------------------------------
-- SAFETY NOTES
-- warningType enum('contraindication','interaction','allergy','pregnancy','dosage','other')
-- severity   enum('low','medium','high','critical')
--
-- Note: schema allows herbID and mixtureID nullable; we use one or the other.
-- ------------------------------------------------------------
INSERT INTO SafetyNotes
(safetyNoteID, herbID, mixtureID, warningType, severity, message, instructions)
VALUES
-- Herb notes
(1,  1,  NULL, 'interaction', 'medium',  'Milk thistle may interact with some medications.', 'If taking prescriptions, consult a professional before use.'),
(2,  4,  NULL, 'interaction', 'medium',  'Ginger supplements may interact with anticoagulants in some cases.', 'Prefer culinary amounts unless advised otherwise.'),
(3,  5,  NULL, 'dosage',      'low',     'Peppermint may worsen reflux in some users.', 'Stop if symptoms worsen.'),
(4,  6,  NULL, 'allergy',     'medium',  'Chamomile may trigger reactions in people allergic to ragweed family.', 'Avoid if you have known allergies.'),
(5,  8,  NULL, 'dosage',      'low',     'Green tea contains caffeine and may affect sleep/anxiety.', 'Avoid late evening; reduce intake if caffeine-sensitive.'),
(6,  10, NULL, 'interaction', 'medium',  'Fenugreek may lower blood sugar and interact with diabetes medication.', 'Consult if taking glucose-lowering prescriptions.'),
(7,  12, NULL, 'interaction', 'high',    'Hawthorn may interact with heart/blood pressure medicines.', 'Consult clinician/pharmacist if on cardiac medication.'),

-- Mixture notes
(8,  NULL, 1,  'other',       'low',     'Digestive Support Blend is supportive wellness guidance only.', 'Use small amounts and discontinue if discomfort increases.'),
(9,  NULL, 2,  'pregnancy',   'medium',  'Evening Calm Blend: pregnancy/allergy considerations may apply.', 'If pregnant or on medication, consult a professional first.'),
(10, NULL, 4,  'interaction', 'high',    'Heart-Friendly Herbal Tea may interact with heart medication.', 'Consult clinician/pharmacist if taking prescriptions.');

-- ------------------------------------------------------------
-- PLANS (conditionID can be NULL; we set it for demo relevance)
-- ------------------------------------------------------------
INSERT INTO Plans (planID, userID, conditionID, title) VALUES
(1, 1, 1, 'Liver support routine (demo)'),
(2, 2, 3, 'Digestive comfort plan (demo)'),
(3, 3, 2, 'Metabolic routine plan (demo)');

-- ------------------------------------------------------------
-- PLAN ITEMS
-- itemType enum('herb','recipe','mixture')
-- NOTE: exactly one of herbID/recipeID/mixtureID should be non-null
-- ------------------------------------------------------------
INSERT INTO PlanItems
(planItemID, planID, herbID, recipeID, mixtureID, itemType, scheduleHint, instructions, notes)
VALUES
-- Plan 1: herb + recipe + mixture
(1, 1, 1,    NULL, NULL, 'herb',   'morning',    'Supportive routine only; read safety notes.', 'Milk thistle (demo).'),
(2, 1, NULL, 1,    NULL, 'recipe', 'lunch',      'Meal suggestion; adjust to preferences.', 'Mediterranean Salad Bowl (demo).'),
(3, 1, NULL, NULL, 3,    'mixture','evening',    'Supportive routine only.', 'Metabolic Routine Blend (demo).'),

-- Plan 2: mixture + herb + recipe
(4, 2, NULL, NULL, 1,    'mixture','after meal', 'Gentle digestive tea routine.', 'Digestive Support Blend (demo).'),
(5, 2, 5,    NULL, NULL, 'herb',   'as needed',  'Only if tolerated; watch reflux.', 'Peppermint (demo).'),
(6, 2, NULL, 7,    NULL, 'recipe', 'dinner',     'Adjust ingredients to tolerance.', 'Gentle Rice Bowl (demo).'),

-- Plan 3: recipe + herb + mixture
(7, 3, NULL, 2,    NULL, 'recipe', 'breakfast',  'Fibre-focused breakfast; portion control.', 'Oatmeal with Berries (demo).'),
(8, 3, 10,   NULL, NULL, 'herb',   'midday',     'Supportive only; check interactions if on meds.', 'Fenugreek (demo).'),
(9, 3, NULL, NULL, 3,    'mixture','evening',    'Supportive routine only; not a treatment.', 'Metabolic Routine Blend (demo).');

-- ------------------------------------------------------------
-- REMINDERS
-- ------------------------------------------------------------
INSERT INTO Reminders
(reminderID, userID, planID, label, remindTime, dayOfWeek, enabled)
VALUES
(1, 1, 1, 'Morning routine check', '08:30:00', 'Mon-Fri', 1),
(2, 1, 1, 'Evening routine check', '20:30:00', 'Daily',   1),
(3, 2, 2, 'Digestive plan check',  '09:00:00', 'Daily',   1),
(4, 3, 3, 'Breakfast reminder',    '07:45:00', 'Mon-Fri', 1);

COMMIT;