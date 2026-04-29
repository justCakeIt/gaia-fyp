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

  return { ok: true };
}

async function createPlan({ userID, conditionID, title, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Plan must contain at least one item");
  }

  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    const [planRes] = await conn.execute(
      `INSERT INTO Plans (userID, conditionID, title)
       VALUES (?, ?, ?)`,
      [userID, conditionID, title]
    );

    const planID = planRes.insertId;

    if (!planID) {
      throw new Error("Failed to create plan");
    }

    for (const it of items) {
      const v = validatePlanItem(it);
      if (!v.ok) throw new Error(v.error);

      await conn.execute(
        `INSERT INTO PlanItems
         (planID, herbID, recipeID, mixtureID, itemType, scheduleHint)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          planID,
          it.herbID ?? null,
          it.recipeID ?? null,
          it.mixtureID ?? null,
          it.itemType,
          it.scheduleHint ?? null,
        ]
      );
    }

    await conn.commit();

    return { planID };
  } catch (err) {
    await conn.rollback();
    console.error("createPlan error:", err.message);
    throw new Error("Failed to save plan in database");
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
  const rows = await db.query(
    `SELECT * FROM Plans WHERE planID = ? LIMIT 1`,
    [planID]
  );

  if (!rows.length) return null;

  return { plan: rows[0] };
}

async function getPlanOwner(planID) {
  const rows = await db.query(
    `SELECT userID FROM Plans WHERE planID = ? LIMIT 1`,
    [planID]
  );
  return rows[0]?.userID ?? null;
}

async function deletePlan(planID) {
  const result = await db.query(
    `DELETE FROM Plans WHERE planID = ?`,
    [planID]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createPlan,
  listPlans,
  getPlan,
  getPlanOwner,
  deletePlan,
};