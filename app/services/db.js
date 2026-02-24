"use strict";

const mysql = require("mysql2/promise");

// One pool for the whole app. Values come from .env via docker-compose env_file.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "sd2-db",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Query helper with safe error logging.
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("DB query error:", {
      sql,
      params,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message,
    });
    throw err;
  }
}

// Health check helper
async function ping() {
  await pool.query("SELECT 1");
  return true;
}

module.exports = {
  query,
  ping,
  pool,
};
