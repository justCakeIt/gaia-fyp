"use strict";

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "gaia_db",

  // MySQL 8 compatibility
  ssl: false,
  authPlugins: undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    // Tag DB errors so the controller can classify them
    err.isDbError = true;
    console.error("DB query error:", {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });
    throw err;
  }
}

async function ping() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  return true;
}

// Startup DB connectivity check — logs but does not crash the server
async function checkConnectivity() {
  try {
    await ping();
    console.log(
      `DB connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    );
    return true;
  } catch (err) {
    console.error(
      `DB connectivity check FAILED: ${err.message}\n` +
        `  host=${process.env.DB_HOST} port=${process.env.DB_PORT}\n` +
        `  If running locally (not in Docker), set DB_HOST=127.0.0.1 and DB_PORT=3308 in .env`
    );
    return false;
  }
}

module.exports = {
  query,
  ping,
  pool,
  checkConnectivity,
};
