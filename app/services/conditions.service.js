"use strict";

const db = require("./db");

const GLOBAL_DISCLAIMER =
  "This content is supportive wellness guidance only. It does not diagnose, treat, or cure disease, and it does not replace your clinician's plan. Do not stop or change medication, supplements, or treatment without consulting a qualified healthcare professional.";

// GET /api/conditions?query=...
async function searchConditions(query) {
  const q = String(query || "").trim();

  // Empty query returns a small list (useful for UI)
  if (!q) {
    return db.query(
      `SELECT conditionID, conditionName, description, category
       FROM Conditions
       ORDER BY conditionName
       LIMIT 20`
    );
  }

  return db.query(
    `SELECT conditionID, conditionName, description, category
     FROM Conditions
     WHERE conditionName LIKE CONCAT('%', ?, '%')
        OR category LIKE CONCAT('%', ?, '%')
     ORDER BY conditionName
     LIMIT 20`,
    [q, q]
  );
}

// GET /api/conditions/match?query=...
async function matchCondition(query) {
  const q = String(query || "").trim().toLowerCase();

  // 1) exact synonym match
  const synRows = await db.query(
    `SELECT c.conditionID, c.conditionName, c.description, c.category,
            'synonym' AS matchType, cs.synonym AS matchedOn
     FROM ConditionSynonyms cs
     JOIN Conditions c ON c.conditionID = cs.conditionID
     WHERE LOWER(cs.synonym) = ?
     LIMIT 1`,
    [q]
  );
  if (synRows.length) return synRows[0];

  // 2) fallback: name contains query
  const nameRows = await db.query(
    `SELECT conditionID, conditionName, description, category,
            'name_like' AS matchType, conditionName AS matchedOn
     FROM Conditions
     WHERE LOWER(conditionName) LIKE CONCAT('%', ?, '%')
     ORDER BY
       CASE WHEN LOWER(conditionName) LIKE CONCAT(?, '%') THEN 0 ELSE 1 END,
       LENGTH(conditionName) ASC
     LIMIT 1`,
    [q, q]
  );
  if (nameRows.length) return nameRows[0];

  return null;
}

// GET /api/conditions/:id/recommendations
async function getRecommendations(conditionID) {
  // Condition lookup — only 404 trigger. All other failures return empty sections.
  let cond;
  try {
    cond = await db.query(
      `SELECT conditionID, conditionName, description, category
       FROM Conditions
       WHERE conditionID = ?
       LIMIT 1`,
      [conditionID]
    );
  } catch (err) {
    console.error("[getRecommendations] condition lookup failed:", err.message);
    throw err; // re-throw so caller can surface a 500
  }
  if (!cond.length) return null;

  // Herbs — safe; returns [] on any DB error
  let herbs = [];
  try {
    herbs = await db.query(
      `SELECT ch.conHerbID, ch.recommendationLevel, ch.notes AS linkNotes,
              h.herbID, h.herbName, h.latinName, h.overview, h.usageNotes
       FROM ConditionHerbs ch
       JOIN Herbs h ON h.herbID = ch.herbID
       WHERE ch.conditionID = ?
       ORDER BY
         FIELD(ch.recommendationLevel, 'recommended','neutral','unknown','avoid'),
         h.herbName`,
      [conditionID]
    );
  } catch (err) {
    console.error("[getRecommendations] herbs query failed:", err.message);
  }
  if (!herbs.length) console.log(`[getRecommendations] conditionID=${conditionID}: herbs section is empty`);

  // Recipes — safe; returns [] on any DB error
  let recipes = [];
  try {
    recipes = await db.query(
      `SELECT cr.conRecipeID, cr.notes AS linkNotes,
              r.recipeID, r.recipeName, r.description, r.prepTime, r.dietTags, r.notes,
              r.ingredients, r.instructions
       FROM ConditionRecipes cr
       JOIN Recipes r ON r.recipeID = cr.recipeID
       WHERE cr.conditionID = ?
       ORDER BY r.recipeName`,
      [conditionID]
    );
  } catch (err) {
    console.error("[getRecommendations] recipes query failed:", err.message);
  }
  if (!recipes.length) console.log(`[getRecommendations] conditionID=${conditionID}: recipes section is empty`);

  // Mixtures via ConditionMixtures — safe; returns [] if table missing or query fails
  let mixtures = [];
  try {
    mixtures = await db.query(
      `SELECT m.mixtureID, m.mixtureName, m.purpose, m.instructions, m.dosage
       FROM Mixtures m
       JOIN ConditionMixtures cm ON cm.mixtureID = m.mixtureID
       WHERE cm.conditionID = ?
       ORDER BY m.mixtureName`,
      [conditionID]
    );
  } catch (err) {
    console.error("[getRecommendations] mixtures query failed:", err.message);
  }
  if (!mixtures.length) console.log(`[getRecommendations] conditionID=${conditionID}: mixtures section is empty`);

  // Safety notes — safe; built only from IDs we actually have
  const herbIDs = (herbs || []).map((h) => h.herbID);
  const mixtureIDs = (mixtures || []).map((m) => m.mixtureID);

  let safetyNotes = [];
  if (herbIDs.length || mixtureIDs.length) {
    try {
      const whereParts = [];
      const params = [];

      if (herbIDs.length) {
        whereParts.push(`(herbID IN (${herbIDs.map(() => "?").join(",")}))`);
        params.push(...herbIDs);
      }
      if (mixtureIDs.length) {
        whereParts.push(`(mixtureID IN (${mixtureIDs.map(() => "?").join(",")}))`);
        params.push(...mixtureIDs);
      }

      safetyNotes = await db.query(
        `SELECT safetyNoteID, herbID, mixtureID, warningType, severity, message, instructions
         FROM SafetyNotes
         WHERE ${whereParts.join(" OR ")}
         ORDER BY
           FIELD(severity,'critical','high','medium','low'),
           warningType`,
        params
      );
    } catch (err) {
      console.error("[getRecommendations] safetyNotes query failed:", err.message);
    }
  }
  if (!safetyNotes.length) console.log(`[getRecommendations] conditionID=${conditionID}: safetyNotes section is empty`);

  return {
    condition: cond[0],
    herbs:       herbs       || [],
    recipes:     recipes     || [],
    mixtures:    mixtures    || [],
    safetyNotes: safetyNotes || [],
    disclaimer:  GLOBAL_DISCLAIMER,
  };
}

module.exports = { searchConditions, matchCondition, getRecommendations };