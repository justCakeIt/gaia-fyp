"use strict";

const db = require("./db");

async function getRecipeByID(recipeID) {
  const rows = await db.query(
    `SELECT recipeID, recipeName, description, prepTime, dietTags, notes, ingredients, instructions
     FROM Recipes
     WHERE recipeID = ?
     LIMIT 1`,
    [recipeID]
  );
  return rows[0] ?? null;
}

async function getMixtureByID(mixtureID) {
  const rows = await db.query(
    `SELECT mixtureID, mixtureName, purpose, instructions, dosage
     FROM Mixtures
     WHERE mixtureID = ?
     LIMIT 1`,
    [mixtureID]
  );
  if (!rows[0]) return null;

  const herbs = await db.query(
    `SELECT h.herbID, h.herbName, h.latinName, mh.amount, mh.unit, mh.role
     FROM MixtureHerbs mh
     JOIN Herbs h ON h.herbID = mh.herbID
     WHERE mh.mixtureID = ?
     ORDER BY FIELD(mh.role, 'main', 'support', 'optional'), h.herbName`,
    [mixtureID]
  );

  let safetyNotes = [];
  try {
    safetyNotes = await db.query(
      `SELECT safetyNoteID, warningType, severity, message, instructions
       FROM SafetyNotes
       WHERE mixtureID = ?
       ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low')`,
      [mixtureID]
    );
  } catch (err) {
    console.error("[getMixtureByID] safetyNotes query failed:", err.message);
  }

  return { ...rows[0], herbs, safetyNotes };
}

module.exports = { getRecipeByID, getMixtureByID };
