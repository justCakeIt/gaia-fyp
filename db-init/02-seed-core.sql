-- ============================================================
-- G.A.I.A. Core Seed Data  —  02-seed-core.sql
-- Run order: 2 of 4
-- Entities only: Users, Conditions, Herbs, Recipes, Mixtures.
-- Relation tables (ConditionHerbs etc.) are in 03-seed-relations.sql
-- ============================================================

USE gaia_db;

START TRANSACTION;

-- ------------------------------------------------------------
-- USERS  (demo accounts; password = 'password' bcrypt)
-- ------------------------------------------------------------
INSERT INTO Users (userID, email, passwordHash, userName) VALUES
(1, 'michal@example.com', '$2b$12$wAYleghTP9z3jVfOSMGpQuElFVHKc6ZCRJ2FIuaT2DRv660BiNBjm', 'Michal'),
(2, 'adam@example.com',   '$2b$12$wAYleghTP9z3jVfOSMGpQuElFVHKc6ZCRJ2FIuaT2DRv660BiNBjm', 'Adam'),
(3, 'alex@example.com',   '$2b$12$wAYleghTP9z3jVfOSMGpQuElFVHKc6ZCRJ2FIuaT2DRv660BiNBjm', 'Alex');

-- ------------------------------------------------------------
-- USER PREFERENCES
-- ------------------------------------------------------------
INSERT INTO UserPreferences (preferenceID, userID, dietType, allergies, dislikes, pregnant, medications, notes)
VALUES
(1, 1, 'none',       'none',    'shellfish',    0, 0, 'Prefers short prep time and simple plans.'),
(2, 2, 'vegetarian', 'nuts',    'very spicy',   0, 1, 'Takes prescription medication; highlight interactions.'),
(3, 3, 'low_carb',   'lactose', 'sugary snacks',0, 0, 'Wants routine-based meal structure; no extreme dieting.');

-- ------------------------------------------------------------
-- CONDITIONS
-- ------------------------------------------------------------
INSERT INTO Conditions (conditionID, conditionName, description, category) VALUES
(1, 'Fatty Liver (MASLD)',            'Supportive lifestyle + nutrition guidance after confirmed diagnosis. Not diagnostic.',             'Liver'),
(2, 'Type 2 Diabetes',               'Supportive meal planning and routine habits for diagnosed users. Not medical advice.',             'Metabolic'),
(3, 'IBS',                           'Supportive digestion-focused guidance. Not a diagnostic tool.',                                    'Digestive'),
(4, 'Hypertension (High Blood Pressure)', 'Supportive lifestyle routines (diet, sleep, activity). Not medical advice.',                  'Cardiovascular'),
(5, 'Stress / Mild Anxiety',         'Supportive wellbeing habits (sleep routine, calming practices). Not medical advice.',             'Wellbeing');

-- ------------------------------------------------------------
-- CONDITION SYNONYMS
-- ------------------------------------------------------------
INSERT INTO ConditionSynonyms (conSynonymID, conditionID, synonym) VALUES
(1,  1, 'fatty liver'),
(2,  1, 'nafld'),
(3,  1, 'masld'),
(4,  1, 'liver fat'),
(5,  2, 't2d'),
(6,  2, 'type two diabetes'),
(7,  2, 'diabetes type 2'),
(8,  3, 'ibs'),
(9,  3, 'irritable bowel syndrome'),
(10, 3, 'gut sensitivity'),
(11, 4, 'high blood pressure'),
(12, 4, 'hypertension'),
(13, 5, 'stress'),
(14, 5, 'anxiety');

-- ------------------------------------------------------------
-- HERBS
-- ------------------------------------------------------------
INSERT INTO Herbs (herbID, herbName, latinName, overview, usageNotes) VALUES
(1,  'Milk thistle',   'Silybum marianum',
     'Silymarin, the active flavonoid complex in milk thistle, has been extensively studied for hepatoprotective properties — reducing oxidative stress and supporting liver cell regeneration in metabolic liver conditions.',
     'Available as standardised capsules (70–80% silymarin) or dried seed tea. Do not replace prescribed care. Discuss with your clinician if you are taking statins or CYP3A4-metabolised medication.'),
(2,  'Artichoke leaf', 'Cynara scolymus',
     'Artichoke leaf (Cynara scolymus) acts as a choleretic, stimulating bile production in the liver and bile flow to the gut, which supports fat digestion and liver detoxification pathways.',
     'Use as a leaf extract, dried tea, or culinary artichoke. Avoid if you have confirmed bile duct obstruction or gallstones. Consult your clinician if on lipid-lowering medication.'),
(3,  'Dandelion',      'Taraxacum officinale',
     'Dandelion root and leaf have been used for centuries as digestive bitters, with preliminary evidence suggesting support for bile production, mild diuretic effect, and antioxidant liver protection.',
     'Widely available as roasted dandelion root tea. May act as a gentle diuretic — stay well hydrated. Avoid if allergic to Asteraceae (ragweed family). May interact with diuretic medication.'),
(4,  'Ginger',         'Zingiber officinale',
     'Ginger contains bioactive compounds (gingerols, shogaols) with potent anti-inflammatory and antioxidant properties, particularly relevant to reducing systemic inflammation associated with MASLD.',
     'Use fresh ginger freely in cooking and as tea. Caution: high-dose ginger supplements (>4g/day) may potentiate anticoagulant medication. Culinary and tea amounts are generally safe.'),
(5,  'Peppermint',     'Mentha x piperita',        'Often used for digestive comfort.',                      'May worsen reflux in some users.'),
(6,  'Chamomile',      'Matricaria chamomilla',     'Traditionally used for relaxation and sleep support.',   'Avoid if allergic to ragweed family plants.'),
(7,  'Lemon balm',     'Melissa officinalis',       'Traditionally used for calm/sleep routines.',            'May cause drowsiness; avoid before driving if affected.'),
(8,  'Green tea',      'Camellia sinensis',
     'Green tea catechins — especially epigallocatechin gallate (EGCG) — have antioxidant properties studied in metabolic and liver health contexts, with emerging evidence in MASLD management.',
     'Drink 1–3 cups earlier in the day to minimise caffeine-related sleep disruption. Reduce intake if caffeine-sensitive. Avoid very high-dose green tea extract supplements, which have been linked to rare cases of liver toxicity.'),
(9,  'Cinnamon',       'Cinnamomum verum',          'Common culinary spice; discussed in metabolic support.', 'Prefer culinary amounts; supplements require caution.'),
(10, 'Fenugreek',      'Trigonella foenum-graecum', 'Traditionally used in metabolic routines.',              'May lower blood sugar; caution with diabetes meds.'),
(11, 'Garlic',         'Allium sativum',            'Food ingredient used in heart-friendly diet patterns.',  'High supplemental doses may increase bleeding risk.'),
(12, 'Hawthorn',       'Crataegus monogyna',        'Traditionally used for cardiovascular wellbeing.',       'Potential interactions with heart/blood pressure medication.'),
(13, 'Turmeric',       'Curcuma longa',
     'Curcumin, the principal polyphenol in turmeric, is a well-characterised anti-inflammatory and antioxidant compound with emerging clinical evidence for reducing liver fat and inflammation in MASLD.',
     'Use liberally as a culinary spice. Combine with black pepper (piperine) to improve curcumin absorption by up to 20-fold. High-dose curcumin supplements require clinical guidance — do not use as a replacement for prescribed therapy.'),
(14, 'Kava',           'Piper methysticum',
     'Kava is a Pacific plant used traditionally for relaxation and anxiety. It carries a well-documented and serious risk of hepatotoxicity, with multiple cases of acute liver failure on record.',
     'CONTRAINDICATED in fatty liver disease and all liver conditions. Do not use in any form (tea, tincture, capsule). Report any previous kava use to your clinician immediately.');

-- ------------------------------------------------------------
-- RECIPES  (10 general + 5 MASLD-specific)
-- ------------------------------------------------------------
INSERT INTO Recipes (recipeID, recipeName, description, prepTime, dietTags, notes, ingredients, instructions)
VALUES
(1,  'Mediterranean Salad Bowl',   'High fibre + healthy fats; simple meal idea.',      15, 'Mediterranean, High fibre',            'Use olive oil + lemon; keep portions balanced.',                  'Lettuce, tomato, cucumber, olive oil, lemon, olives', 'Mix ingredients; dress with olive oil and lemon.'),
(2,  'Oatmeal with Berries',        'Fibre-focused breakfast option.',                   10, 'High fibre, Low sugar',                'Avoid added sugar; adjust portion size.',                          'Oats, mixed berries, water, ground cinnamon', 'Cook oats; top with berries and a small amount of cinnamon.'),
(3,  'Simple Ginger Tea',           'Warm drink using fresh ginger.',                     8, 'Digestive',                            'Stop if irritation occurs.',                                       'Fresh ginger, water', 'Simmer sliced ginger 5–8 minutes; strain and serve.'),
(4,  'Low-Sugar Yogurt Bowl',       'Protein + fibre snack/meal idea.',                   7, 'Low sugar, High protein',              'Choose unsweetened yogurt.',                                       'Plain unsweetened yogurt, mixed berries, chia seeds', 'Combine ingredients; adjust portion size to preference.'),
(5,  'Grilled Veg Plate',           'Vegetable-focused meal with olive oil.',             25, 'Vegetarian, Mediterranean',            'Use herbs instead of extra salt.',                                 'Courgette, pepper, red onion, olive oil, fresh herbs', 'Grill vegetables; drizzle with olive oil and herbs.'),
(6,  'Balanced Plate (Protein + Greens)', 'Simple balanced meal layout.',                20, 'Balanced, Low sugar',                  'Keep processed foods low; watch salt.',                            'Chicken breast or firm tofu, leafy greens, olive oil', 'Cook protein; serve with greens and a drizzle of olive oil.'),
(7,  'Gentle Rice Bowl',            'Simple meal idea for sensitive digestion.',          20, 'Gentle, Gluten free',                  'Adjust ingredients to tolerance.',                                 'White rice, carrot, courgette, olive oil', 'Cook rice; sauté vegetables gently; combine.'),
(8,  'Chamomile Evening Tea',       'Non-caffeinated evening drink routine.',              5, 'Sleep support',                        'Avoid if ragweed allergy.',                                        'Chamomile tea bag, hot water', 'Steep 3–5 minutes; allow to cool slightly before drinking.'),
(9,  'Garlic-Lemon Chickpea Salad','Plant protein + fibre meal.',                        12, 'Vegetarian, High fibre',               'Reduce garlic if sensitive.',                                      'Tinned chickpeas, lemon, garlic, olive oil, flat-leaf parsley', 'Mix ingredients; adjust garlic to tolerance.'),
(10, 'Green Tea Routine',           'Caffeine drink to use earlier in day.',               5, 'Antioxidant',                          'Avoid late evening; stay hydrated.',                               'Green tea bag, hot water', 'Steep 2–3 minutes; avoid drinking after 3pm.'),
-- MASLD-specific recipes
(11, 'Golden Milk Porridge',
    'Warming oat porridge with turmeric and cinnamon — anti-inflammatory, fibre-rich and liver-friendly.',
    12, 'Anti-inflammatory, High fibre, Gluten free',
    'Black pepper significantly enhances curcumin absorption from turmeric. Use certified gluten-free oats if coeliac. Avoid adding sugar — the spices provide natural warmth.',
    'Rolled oats (80g), unsweetened almond milk (250ml), ground turmeric (½ tsp), ground cinnamon (¼ tsp), black pepper (pinch), walnuts (small handful), honey (optional — ½ tsp)',
    '1. Heat almond milk in a saucepan over medium heat. 2. Stir in oats and cook for 5–7 minutes, stirring regularly, until thick and creamy. 3. Add turmeric, cinnamon and a pinch of black pepper; stir well to combine. 4. Spoon into a bowl and top with a small handful of walnuts. 5. Add a very small drizzle of honey if desired. 6. Serve immediately.'),
(12, 'Herb-Roasted Salmon with Wilted Spinach',
    'Baked salmon with garlic and lemon on wilted spinach — omega-3 rich, low in refined carbs and deeply liver-supportive.',
    25, 'High protein, Anti-inflammatory, Low sugar',
    'Oily fish (salmon, mackerel, sardines) are strongly recommended for MASLD. Aim for 2 portions per week. Use sea salt sparingly — season with lemon and herbs instead.',
    'Salmon fillet (150–180g), fresh spinach (2 large handfuls), garlic (2 cloves, thinly sliced), lemon (½), extra virgin olive oil (1 tbsp), fresh dill or flat-leaf parsley, black pepper',
    '1. Preheat oven to 200°C (fan 180°C). 2. Place salmon on a parchment-lined baking tray. Drizzle with olive oil and scatter garlic slices over the top. Squeeze over half the lemon and season with black pepper. 3. Bake for 15–18 minutes until salmon is just cooked through and flakes easily at the thickest point. 4. While salmon rests, wilt spinach in a dry pan over high heat for 1–2 minutes. Season with a crack of black pepper. 5. Plate the spinach; rest the salmon on top. Garnish with fresh herbs and remaining lemon wedge.'),
(13, 'Artichoke & Chickpea Mediterranean Bowl',
    'A fibre-rich plant-based bowl with artichoke hearts, chickpeas and tahini dressing — cholesterol-friendly and liver-supportive.',
    15, 'Mediterranean, High fibre, Plant-based',
    'Artichoke is a prebiotic food with choleretic (bile-stimulating) properties. Tinned artichoke hearts work perfectly here. Avoid adding salt — the tahini provides natural savouriness.',
    'Tinned artichoke hearts, drained (200g), tinned chickpeas, rinsed (200g), cherry tomatoes (12, halved), cucumber (½, diced), red onion (¼, finely sliced), fresh flat-leaf parsley — Dressing: tahini (1 tbsp), lemon juice (2 tbsp), water (1 tbsp), garlic (¼ clove, finely grated), extra virgin olive oil (1 tsp)',
    '1. Quarter the artichoke hearts and place in a large bowl with the rinsed chickpeas. 2. Add cherry tomatoes, diced cucumber and finely sliced red onion. 3. Prepare the dressing: whisk tahini, lemon juice, water, grated garlic and olive oil together until smooth and pourable. 4. Pour dressing over the salad and toss gently to coat. 5. Finish with a generous handful of fresh parsley and a crack of black pepper. 6. Serve at room temperature.'),
(14, 'Anti-inflammatory Grain Bowl',
    'Quinoa and roasted sweet potato with a turmeric-lemon dressing, topped with avocado and edamame — antioxidant-dense and deeply nourishing.',
    30, 'Anti-inflammatory, High fibre, Gluten free',
    'This bowl is naturally gluten free. Sweet potato provides beta-carotene; avocado provides liver-supportive monounsaturated fats. Eat within 1 hour of assembly for best texture.',
    'Quinoa (80g dry weight), sweet potato (1 medium, peeled and diced), edamame beans (60g, defrosted from frozen), avocado (½, sliced), red cabbage (small handful, finely shredded), sesame seeds (1 tsp) — Dressing: extra virgin olive oil (1 tbsp), lemon juice (1 tbsp), ground turmeric (¼ tsp), black pepper (pinch)',
    '1. Cook quinoa in 200ml water over medium heat for 12–15 minutes until the liquid is absorbed and germs separate. Fluff with a fork and allow to cool. 2. Toss diced sweet potato in a little olive oil and roast at 200°C for 20–22 minutes until tender and beginning to caramelise. 3. Whisk all dressing ingredients together in a small bowl. 4. Assemble the bowl: quinoa as the base, then roasted sweet potato, edamame, shredded red cabbage and sliced avocado arranged in sections. 5. Drizzle the turmeric dressing over everything and scatter sesame seeds to finish.'),
(15, 'Dandelion Leaf Salad with Walnuts & Apple',
    'A bitter-leaf salad with dandelion greens, toasted walnuts and apple — supports bile flow, digestive function and provides omega-3 fatty acids.',
    10, 'Low sugar, Anti-inflammatory, Raw',
    'Dandelion greens are intensely bitter. Mix with a milder leaf (spinach or lamb''s lettuce) if preferred. Keep apple portion small to limit fructose intake. Dress just before serving.',
    'Dandelion leaves or rocket (large handful), walnuts (30g), green apple (½, cored and thinly sliced), red onion (¼, very finely sliced) — Dressing: apple cider vinegar (1 tbsp), extra virgin olive oil (2 tbsp), Dijon mustard (¼ tsp), honey (½ tsp), black pepper (pinch)',
    '1. Wash and spin-dry the greens; tear any large leaves into manageable pieces. 2. Toast walnuts in a dry frying pan over medium heat for 2–3 minutes until fragrant. Remove from heat and allow to cool before adding to the salad. 3. Whisk all dressing ingredients together in a small bowl until emulsified. 4. Combine greens, apple slices and onion in a large salad bowl. 5. Add cooled walnuts. 6. Drizzle dressing over just before serving and toss gently to coat. Serve immediately.');

-- ------------------------------------------------------------
-- MIXTURES  (8 total: 4 general + 3 MASLD + 1 Hepatic Elixir)
-- All include dosage column (NULL where not specified)
-- ------------------------------------------------------------
INSERT INTO Mixtures (mixtureID, mixtureName, purpose, instructions, dosage) VALUES
(1, 'Digestive Support Blend',
    'Digestive comfort support',
    'Use as a tea blend; start small and discontinue if symptoms worsen.',
    NULL),
(2, 'Evening Calm Blend',
    'Relaxation / sleep routine support',
    'Use as evening tea. Avoid if allergic to components.',
    NULL),
(3, 'Metabolic Routine Blend',
    'Routine support for balanced eating habits',
    'Supportive routine only. Not a treatment.',
    NULL),
(4, 'Heart-Friendly Herbal Tea',
    'Cardiovascular wellbeing support',
    'Consult professional if taking heart/blood pressure medication.',
    NULL),
(5, 'Liver Support Infusion',
    'A botanical herbal tea combining milk thistle and dandelion root, traditionally used to support liver function and bile production.',
    '1. Combine 1 tsp dried milk thistle seeds (crushed, or 1 standardised tea bag) with ½ tsp dried dandelion root in a teapot or infuser. 2. Pour 250ml near-boiling water (90°C) over the herbs. 3. Cover and steep for 8–10 minutes. 4. Strain carefully and allow to cool slightly before drinking. 5. Drink 1 cup once or twice daily, ideally before meals. 6. Limit continuous use to 8 weeks; take a 2-week break before resuming.',
    NULL),
(6, 'Anti-inflammatory Herbal Blend',
    'A warming ginger and turmeric preparation aimed at reducing the systemic inflammation associated with metabolic liver conditions.',
    '1. Slice a 2cm piece of fresh ginger root. 2. Add to 300ml cold water in a small saucepan along with ½ tsp ground turmeric. 3. Bring to a gentle simmer over medium heat and cook for 8 minutes. 4. Strain into a mug. 5. Add a pinch of freshly ground black pepper — this significantly enhances curcumin absorption. 6. Finish with a squeeze of fresh lemon. 7. Drink 1 cup daily. Start with half a cup to assess tolerance.',
    NULL),
(7, 'Digestive Bitter Tonic',
    'A traditional herbal bitter combining artichoke leaf and dandelion, used to support bile secretion and healthy digestive function before meals.',
    '1. Add ½ tsp artichoke leaf powder (or 1 artichoke leaf tea bag) and ½ tsp dried dandelion leaf to a cup. 2. Pour 200ml hot water (not boiling). 3. Steep covered for 5 minutes, then strain. 4. Drink 15–20 minutes before your main meal. 5. If using tincture form: dilute 20 drops of artichoke/dandelion extract in a small glass of water and drink before meals. 6. Discontinue and consult your clinician if you experience abdominal cramping or worsening symptoms.',
    NULL),
(8, 'Hepatic Support Elixir',
    'Supportive botanical formulation for liver function, digestion, and metabolic balance in MASLD.',
    '1. Add dried milk thistle seeds (1 tsp, lightly crushed) and dried dandelion root (½ tsp) to a small saucepan with 350ml of cold water. 2. Add ¼ tsp ground turmeric and 3–4 thin slices of fresh ginger root. 3. Bring to a gentle simmer over medium heat, then reduce the heat to low. 4. Simmer uncovered for 10–15 minutes, allowing the herbs to release their active compounds. 5. Remove from heat and strain carefully through a fine-mesh sieve into a mug. 6. Add a pinch of freshly ground black pepper — this significantly enhances curcumin absorption. 7. Allow to cool to a comfortable drinking temperature. Serve warm.',
    '1 cup daily, preferably in the morning or 20 minutes before meals.');

-- ------------------------------------------------------------
-- MIXTURE HERBS
-- ------------------------------------------------------------
INSERT INTO MixtureHerbs (mixtureHerbID, mixtureID, herbID, amount, unit, role) VALUES
-- Digestive Support Blend
(1,  1,  5,  1.00, 'tsp',      'main'),    -- Peppermint
(2,  1,  4,  0.50, 'tsp',      'support'), -- Ginger
-- Evening Calm Blend
(3,  2,  6,  1.00, 'tsp',      'main'),    -- Chamomile
(4,  2,  7,  0.50, 'tsp',      'support'), -- Lemon balm
-- Metabolic Routine Blend
(5,  3,  9,  0.50, 'tsp',      'main'),    -- Cinnamon
(6,  3, 10,  0.50, 'tsp',      'support'), -- Fenugreek
-- Heart-Friendly Herbal Tea
(7,  4, 12,  0.50, 'tsp',      'main'),    -- Hawthorn
(8,  4,  8,  0.50, 'tsp',      'support'), -- Green tea
-- Liver Support Infusion
(9,  5,  1,  1.00, 'tsp',      'main'),    -- Milk thistle
(10, 5,  3,  0.50, 'tsp',      'support'), -- Dandelion
-- Anti-inflammatory Herbal Blend
(11, 6, 13,  0.50, 'tsp',      'main'),    -- Turmeric
(12, 6,  4,  2.00, 'cm slice', 'support'), -- Ginger
-- Digestive Bitter Tonic
(13, 7,  2,  0.50, 'tsp',      'main'),    -- Artichoke leaf
(14, 7,  3,  0.50, 'tsp',      'support'), -- Dandelion
-- Hepatic Support Elixir
(15, 8,  1,  1.00, 'tsp',      'main'),    -- Milk thistle
(16, 8,  3,  0.50, 'tsp',      'support'), -- Dandelion
(17, 8, 13,  0.25, 'tsp',      'support'), -- Turmeric
(18, 8,  4,  1.00, 'cm slice', 'support'); -- Ginger

-- ------------------------------------------------------------
-- SAFETY NOTES
-- ------------------------------------------------------------
INSERT INTO SafetyNotes (safetyNoteID, herbID, mixtureID, warningType, severity, message, instructions)
VALUES
-- General herb notes
(1,  1,  NULL, 'interaction',      'medium',   'Milk thistle may interact with some medications metabolised by the liver (CYP enzymes).',                                                                       'If taking prescriptions, consult a professional before use.'),
(2,  4,  NULL, 'interaction',      'medium',   'Ginger supplements may interact with anticoagulants in some cases.',                                                                                           'Prefer culinary amounts unless advised otherwise.'),
(3,  5,  NULL, 'dosage',           'low',      'Peppermint may worsen reflux in some users.',                                                                                                                  'Stop if symptoms worsen.'),
(4,  6,  NULL, 'allergy',          'medium',   'Chamomile may trigger reactions in people allergic to ragweed family.',                                                                                        'Avoid if you have known allergies.'),
(5,  8,  NULL, 'dosage',           'low',      'Green tea contains caffeine and may affect sleep/anxiety. Very high-dose extracts have been linked to rare liver toxicity.',                                    'Avoid late evening; reduce intake if caffeine-sensitive. Do not use concentrated green tea extract supplements.'),
(6,  10, NULL, 'interaction',      'medium',   'Fenugreek may lower blood sugar and interact with diabetes medication.',                                                                                       'Consult if taking glucose-lowering prescriptions.'),
(7,  12, NULL, 'interaction',      'high',     'Hawthorn may interact with heart/blood pressure medicines.',                                                                                                   'Consult clinician/pharmacist if on cardiac medication.'),
-- General mixture notes
(8,  NULL, 1,  'other',            'low',      'Digestive Support Blend is supportive wellness guidance only.',                                                                                                'Use small amounts and discontinue if discomfort increases.'),
(9,  NULL, 2,  'pregnancy',        'medium',   'Evening Calm Blend: pregnancy/allergy considerations may apply.',                                                                                              'If pregnant or on medication, consult a professional first.'),
(10, NULL, 4,  'interaction',      'high',     'Heart-Friendly Herbal Tea may interact with heart medication.',                                                                                                'Consult clinician/pharmacist if taking prescriptions.'),
-- MASLD lifestyle warnings (anchored to milk thistle as herbID)
(11, 1,  NULL, 'contraindication', 'high',
    'Alcohol must be avoided entirely with fatty liver disease. Even low regular alcohol intake can accelerate liver damage and disease progression in MASLD.',
    'If you currently drink alcohol, discuss a structured reduction plan with your GP or liver specialist. Do not make sudden changes to alcohol intake without medical support.'),
(12, 1,  NULL, 'dosage',           'medium',
    'Excess dietary fructose and added sugars directly drive liver fat accumulation. Avoid sugar-sweetened beverages, fruit juice and high-sugar snacks. Prioritise whole fruit in modest portions.',
    'Read product labels for hidden sugars (sucrose, glucose-fructose syrup, maltose, dextrose). Aim for no more than 25g added sugar per day. Discuss dietary changes with a registered dietitian.'),
(13, 1,  NULL, 'other',            'medium',
    'Aim for gradual, sustained weight loss if overweight — approximately 0.5–1.0kg per week. Rapid weight loss (greater than 2kg per week) can paradoxically trigger liver inflammation.',
    'Crash diets and very low calorie regimens should only be used under medical supervision. A structured, dietitian-led approach is strongly recommended for MASLD-related weight management.'),
(14, 13, NULL, 'interaction',      'medium',
    'Curcumin supplements at high doses may interact with anticoagulants (e.g. warfarin, aspirin) and some cholesterol-lowering medication. Culinary turmeric is safe at normal cooking amounts.',
    'If you are on blood-thinning medication or liver-metabolised drugs, consult your prescriber before taking curcumin supplements. Use turmeric freely as a food spice.'),
(15, 14, NULL, 'contraindication', 'critical',
    'Kava (Piper methysticum) is contraindicated in fatty liver disease. It has been associated with serious hepatotoxicity including acute liver failure in multiple documented cases.',
    'Do not use kava in any form — tea, tincture, powder or capsule — if you have MASLD or any liver condition. Report any previous kava use to your clinician immediately.'),
-- MASLD mixture safety notes
(16, NULL, 5,  'interaction',      'medium',
    'Milk thistle and dandelion may interact with certain medications metabolised by the liver. Start with a half-dose to assess individual tolerance.',
    'Inform your clinician or pharmacist that you are using this blend, particularly if you are taking prescription medication. Do not use during pregnancy without professional guidance.'),
(17, NULL, 6,  'interaction',      'low',
    'This blend is supportive wellness guidance only. Ginger at high supplemental doses may interact with anticoagulant medication — tea-strength preparation is generally safe.',
    'If you are pregnant, on blood-thinning medication or recovering from surgery, consult your clinician before regular use. Discontinue if you experience heartburn or digestive discomfort.'),
(18, NULL, 8,  'other',            'medium',
    'Consult your healthcare provider before use if you are on prescription medication, pregnant, or breastfeeding. Milk thistle may interact with medications metabolised by the liver.',
    'Not suitable during pregnancy without professional guidance. Not a replacement for prescribed care — supportive use only. Discontinue and seek advice if you experience unusual symptoms.');

-- ------------------------------------------------------------
-- PLANS  (demo — one per user, tied to their relevant condition)
-- ------------------------------------------------------------
INSERT INTO Plans (planID, userID, conditionID, title) VALUES
(1, 1, 1, 'Liver support routine (demo)'),
(2, 2, 3, 'Digestive comfort plan (demo)'),
(3, 3, 2, 'Metabolic routine plan (demo)');

-- ------------------------------------------------------------
-- PLAN ITEMS
-- ------------------------------------------------------------
INSERT INTO PlanItems (planItemID, planID, herbID, recipeID, mixtureID, itemType, scheduleHint, instructions, notes)
VALUES
-- Plan 1 (Michal — MASLD)
(1, 1, 1,    NULL, NULL, 'herb',    'morning',     'Supportive routine only; read safety notes.', 'Milk thistle (demo).'),
(2, 1, NULL, 11,   NULL, 'recipe',  'breakfast',   'Anti-inflammatory breakfast option.',         'Golden Milk Porridge (demo).'),
(3, 1, NULL, NULL, 8,    'mixture', 'morning',     'Hepatic elixir — 1 cup before meals.',        'Hepatic Support Elixir (demo).'),
-- Plan 2 (Adam — IBS)
(4, 2, NULL, NULL, 1,    'mixture', 'after meal',  'Gentle digestive tea routine.',               'Digestive Support Blend (demo).'),
(5, 2, 5,    NULL, NULL, 'herb',    'as needed',   'Only if tolerated; watch reflux.',            'Peppermint (demo).'),
(6, 2, NULL, 7,    NULL, 'recipe',  'dinner',      'Adjust ingredients to tolerance.',            'Gentle Rice Bowl (demo).'),
-- Plan 3 (Alex — T2D)
(7, 3, NULL, 2,    NULL, 'recipe',  'breakfast',   'Fibre-focused breakfast; portion control.',   'Oatmeal with Berries (demo).'),
(8, 3, 10,   NULL, NULL, 'herb',    'midday',      'Supportive only; check interactions if on meds.', 'Fenugreek (demo).'),
(9, 3, NULL, NULL, 3,    'mixture', 'evening',     'Supportive routine only; not a treatment.',   'Metabolic Routine Blend (demo).');

-- ------------------------------------------------------------
-- REMINDERS
-- ------------------------------------------------------------
INSERT INTO Reminders (reminderID, userID, planID, label, remindTime, dayOfWeek, enabled)
VALUES
(1, 1, 1, 'Morning routine check', '08:30:00', 'Mon-Fri', 1),
(2, 1, 1, 'Evening routine check', '20:30:00', 'Daily',   1),
(3, 2, 2, 'Digestive plan check',  '09:00:00', 'Daily',   1),
(4, 3, 3, 'Breakfast reminder',    '07:45:00', 'Mon-Fri', 1);

COMMIT;
