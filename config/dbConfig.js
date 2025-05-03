const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Esperar a que haya una conexión disponible si todas están ocupadas
  connectionLimit: 10, // Número máximo de conexiones en el pool
  queueLimit: 0, // Número máximo de conexiones en espera
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

// Crear tablas si no existen (función para inicialización)
const createTables = async () => {
  const connection = await getConnection(); // Usamos el pool para obtener una conexión

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY, 
      message TEXT,
      data TEXT,
      reserva TEXT,
      status TEXT,
      timestamp TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `;

  try {
    await connection.execute(createUsersTable); // Creación de la tabla de usuarios
    await connection.execute(createNotificationsTable); // Creación de la tabla de notificaciones
    console.log("Tablas creadas o verificadas correctamente.");
  } catch (error) {
    console.error("Error creando las tablas:", error);
  } finally {
    connection.release(); // Liberar la conexión del pool
  }
};

module.exports = { getConnection, createTables };
