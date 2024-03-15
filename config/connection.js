const mysql = require("mysql2");
// Database connection
const pool = mysql
  .createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
    dateStrings: true,
  })
  .promise();

pool.getConnection((err, connection) => {
  if (err) throw err; // connection unsuccessful
  console.log("Connected as ID " + connection.threadId);
});

module.exports = pool;
