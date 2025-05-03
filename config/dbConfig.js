require("dotenv").config(); // Cargar variables de entorno desde .env

const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const getConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    throw error;
  }
};

module.exports = { getConnection };
