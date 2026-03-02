"use strict";

const db = require("./db");

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
  const cond = await db.query(
    `SELECT conditionID, conditionName, description, category
     FROM Conditions
     WHERE conditionID = ?
     LIMIT 1`,
    [conditionID]
  );
  if (!cond.length) return null;

  const herbs = await db.query(
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

  const recipes = await db.query(
    `SELECT cr.conRecipeID, cr.notes AS linkNotes,
            r.recipeID, r.recipeName, r.description, r.prepTime, r.dietTags, r.notes,
            r.ingredients, r.instructions
     FROM ConditionRecipes cr
     JOIN Recipes r ON r.recipeID = cr.recipeID
     WHERE cr.conditionID = ?
     ORDER BY r.recipeName`,
    [conditionID]
  );

  const mixtures = await db.query(
    `SELECT DISTINCT m.mixtureID, m.mixtureName, m.purpose, m.instructions
     FROM Mixtures m
     JOIN MixtureHerbs mh ON mh.mixtureID = m.mixtureID
     JOIN ConditionHerbs ch ON ch.herbID = mh.herbID
     WHERE ch.conditionID = ?
     ORDER BY m.mixtureName`,
    [conditionID]
  );

  const herbIDs = herbs.map((h) => h.herbID);
  const mixtureIDs = mixtures.map((m) => m.mixtureID);

  let safetyNotes = [];
  if (herbIDs.length || mixtureIDs.length) {
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
  }

  return {
    condition: cond[0],
    herbs,
    recipes,
    mixtures,
    safetyNotes,
  };
}

module.exports = { searchConditions, matchCondition, getRecommendations };