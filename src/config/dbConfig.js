// ./src//config/dbConfig.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST, // El host de la base de datos proporcionado por Railway o entorno local
  user: process.env.DB_USER, // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña de la base de datos
  database: process.env.DB_NAME, // Nombre de la base de datos
  port: process.env.DB_PORT || 3306, // Puerto de la base de datos (3306 por defecto)
};

/**
 * Crea una conexión desde el pool de conexiones.
 * @returns {Promise<mysql.Connection>} Retorna una promesa que resuelve con la conexión a la base de datos.
 */
const getConnection = async () => {
  try {
    return await mysql.createPool(dbConfig).getConnection(); // Obtener una conexión desde el pool
  } catch (error) {
    console.error("Error al obtener conexión desde el pool:", error);
    throw error; // Lanzamos el error para que se gestione en el controlador
  }
};

module.exports = { getConnection };
