"use strict";

const db = require("./db");

async function findUserByEmail(email) {
  const rows = await db.query(
    `SELECT userID, email, passwordHash, userName, since
     FROM Users
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

async function createLocalUser({ email, passwordHash, userName }) {
  let result;
  try {
    result = await db.query(
      `INSERT INTO Users (email, passwordHash, userName)
       VALUES (?, ?, ?)`,
      [email, passwordHash, userName]
    );
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      throw new Error("account with this email already exists");
    }
    throw error;
  }

  return {
    userID: Number(result.insertId),
    email,
    userName,
  };
}

async function updateUserName(userID, userName) {
  await db.query(
    `UPDATE Users
     SET userName = ?
     WHERE userID = ?`,
    [userName, userID]
  );
}

async function updatePasswordHash(userID, passwordHash) {
  await db.query(
    `UPDATE Users
     SET passwordHash = ?
     WHERE userID = ?`,
    [passwordHash, userID]
  );
}

module.exports = {
  findUserByEmail,
  createLocalUser,
  updateUserName,
  updatePasswordHash,
};
