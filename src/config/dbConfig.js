// ./src//config/dbConfig.js
const mysql = require("mysql2/promise");
require("dotenv").config();

console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);
console.log(process.env.DB_PORT);

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST, // El host de la base de datos proporcionado por Railway
  user: process.env.DB_USER, // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña de la base de datos
  database: process.env.DB_NAME, // Nombre de la base de datos
  port: process.env.DB_PORT || 3306, // Usar el puerto de la base de datos, 3306 por defecto
};
const pool = mysql.createPool(dbConfig);

// Función para obtener una conexión desde el pool
const getConnection = async () => {
  try {
    return await pool.getConnection(); // Obtener conexión desde el pool
  } catch (error) {
    console.error("Error al obtener conexión desde el pool:", error);
    throw error; // Lanzamos el error para que se gestione donde se utilice
  }
};

module.exports = { getConnection };
