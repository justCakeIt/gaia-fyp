"use strict";

const db = require("./db");

// POST /api/reminders
async function createReminder({ userID, planID, label, remindTime, dayOfWeek, enabled }) {
  const result = await db.query(
    `INSERT INTO Reminders (userID, planID, label, remindTime, dayOfWeek, enabled)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userID, planID, label, remindTime, dayOfWeek, enabled]
  );

  // mysql2 returns OkPacket for insert
  return { reminderID: result.insertId };
}

// GET /api/reminders?userID=...
async function listReminders(userID) {
  return db.query(
    `SELECT r.reminderID, r.userID, r.planID, r.label, r.remindTime, r.dayOfWeek, r.enabled,
            p.title AS planTitle
     FROM Reminders r
     LEFT JOIN Plans p ON p.planID = r.planID
     WHERE r.userID = ?
     ORDER BY r.enabled DESC, r.remindTime ASC, r.reminderID DESC`,
    [userID]
  );
}

async function deleteReminder(reminderID) {
  const result = await db.query(
    `DELETE FROM Reminders WHERE reminderID = ?`,
    [reminderID]
  );
  return result.affectedRows > 0;
}

module.exports = { createReminder, listReminders, deleteReminder };