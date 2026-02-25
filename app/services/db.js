"use strict";

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("DB query error:", {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message,
    });
    throw err;
  }
}

async function ping() {
  await pool.query("SELECT 1");
  return true;
}

module.exports = {
  query,
  ping,
  pool,
};