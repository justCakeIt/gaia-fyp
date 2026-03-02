"use strict";

const db = require("./db");

function validatePlanItem(item) {
  const it = item || {};
  const itemType = it.itemType;
  const herbID = it.herbID ?? null;
  const recipeID = it.recipeID ?? null;
  const mixtureID = it.mixtureID ?? null;

  if (!["herb", "recipe", "mixture"].includes(itemType)) {
    return { ok: false, error: "itemType must be herb|recipe|mixture" };
  }

  const count = (herbID ? 1 : 0) + (recipeID ? 1 : 0) + (mixtureID ? 1 : 0);
  if (count !== 1) {
    return { ok: false, error: "exactly one of herbID/recipeID/mixtureID must be set" };
  }

  if (itemType === "herb" && !herbID) return { ok: false, error: "herb item requires herbID" };
  if (itemType === "recipe" && !recipeID) return { ok: false, error: "recipe item requires recipeID" };
  if (itemType === "mixture" && !mixtureID) return { ok: false, error: "mixture item requires mixtureID" };

  return { ok: true };
}

async function assertExists(table, idColumn, idValue, label) {
  const rows = await db.query(
    `SELECT ${idColumn} AS id FROM ${table} WHERE ${idColumn} = ? LIMIT 1`,
    [idValue]
  );
  if (!rows.length) throw new Error(`${label} not found: ${idValue}`);
}

async function createPlan({ userID, conditionID, title, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid plan: items must be a non-empty array");
  }

  // (Optional) uncomment if you want strict validation:
  // await assertExists("Users", "userID", userID, "User");
  // if (conditionID !== null) await assertExists("Conditions", "conditionID", conditionID, "Condition");

  for (const it of items) {
    const v = validatePlanItem(it);
    if (!v.ok) throw new Error(`Invalid plan item: ${v.error}`);
  }

  // Validate referenced entities exist (nice UX; prevents FK errors)
  for (const it of items) {
    if (it.itemType === "herb") await assertExists("Herbs", "herbID", it.herbID, "Herb");
    if (it.itemType === "recipe") await assertExists("Recipes", "recipeID", it.recipeID, "Recipe");
    if (it.itemType === "mixture") await assertExists("Mixtures", "mixtureID", it.mixtureID, "Mixture");
  }

  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();

    const [planRes] = await conn.execute(
      `INSERT INTO Plans (userID, conditionID, title) VALUES (?, ?, ?)`,
      [userID, conditionID, title]
    );
    const planID = planRes.insertId;

    for (const it of items) {
      await conn.execute(
        `INSERT INTO PlanItems
           (planID, herbID, recipeID, mixtureID, itemType, scheduleHint, instructions, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          planID,
          it.herbID ?? null,
          it.recipeID ?? null,
          it.mixtureID ?? null,
          it.itemType,
          it.scheduleHint ?? null,
          it.instructions ?? null,
          it.notes ?? null,
        ]
      );
    }

    await conn.commit();
    return { planID };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function listPlans(userID) {
  return db.query(
    `SELECT planID, userID, conditionID, title
     FROM Plans
     WHERE userID = ?
     ORDER BY planID DESC`,
    [userID]
  );
}

async function getPlan(planID) {
  const planRows = await db.query(
    `SELECT p.planID, p.userID, p.conditionID, p.title,
            c.conditionName
     FROM Plans p
     LEFT JOIN Conditions c ON c.conditionID = p.conditionID
     WHERE p.planID = ?
     LIMIT 1`,
    [planID]
  );
  if (!planRows.length) return null;

  const items = await db.query(
    `SELECT planItemID, planID, herbID, recipeID, mixtureID, itemType, scheduleHint, instructions, notes
     FROM PlanItems
     WHERE planID = ?
     ORDER BY planItemID`,
    [planID]
  );

  const herbIDs = items.filter((i) => i.herbID).map((i) => i.herbID);
  const mixtureIDs = items.filter((i) => i.mixtureID).map((i) => i.mixtureID);

  let safetyNotes = [];
  if (herbIDs.length || mixtureIDs.length) {
    const where = [];
    const params = [];

    if (herbIDs.length) {
      where.push(`(herbID IN (${herbIDs.map(() => "?").join(",")}))`);
      params.push(...herbIDs);
    }
    if (mixtureIDs.length) {
      where.push(`(mixtureID IN (${mixtureIDs.map(() => "?").join(",")}))`);
      params.push(...mixtureIDs);
    }

    safetyNotes = await db.query(
      `SELECT safetyNoteID, herbID, mixtureID, warningType, severity, message, instructions
       FROM SafetyNotes
       WHERE ${where.join(" OR ")}
       ORDER BY
         FIELD(severity,'critical','high','medium','low'),
         safetyNoteID DESC`,
      params
    );
  }

  return { plan: planRows[0], items, safetyNotes };
}

module.exports = { createPlan, listPlans, getPlan };