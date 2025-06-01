//./src/socket-io/socketIo.js
const { Server } = require("socket.io");
const express = require("express");
const { createServer } = require("http");
const allowedOrigins = require("../../corsConfig");
const { verifyToken } = require("../services/authService");

const app = express();
const httpServer = createServer(app);

// Mapa para almacenar las conexiones activas (userID -> socket)
const activeConnections = new Map();

// Configuración del servidor Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Orígenes permitidos definidos en corsConfig
    methods: ["GET", "POST", "PATCH"], // Métodos HTTP permitidos
    credentials: true, // Permite el uso de cookies
  },
});

/**
 * Middleware para autenticar conexiones de Socket.IO.
 * @param {Object} socket - Objeto de socket de la conexión.
 * @param {Function} next - Función para continuar con el flujo de conexión.
 */
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token; // Extraemos el token desde el handshake
    if (!token) {
      throw new Error("Token no proporcionado");
    }

    const decoded = verifyToken(token); // Verificamos el token JWT
    socket.userId = decoded.userId; // Almacenamos el userId en el socket
    next(); // Continuamos con la conexión
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    next(new Error("Autenticación fallida"));
  }
});

/**
 * Evento que maneja la conexión de un nuevo usuario.
 * @param {Object} socket - El objeto de socket de la nueva conexión.
 */
io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`[${new Date().toISOString()}] Usuario conectado: ${userId}`);

  if (activeConnections.has(userId)) {
    const prevSocket = activeConnections.get(userId);
    if (!prevSocket.disconnected) {
      console.log(
        `[${new Date().toISOString()}] Usuario ${userId} tenía sesión previa, se desconecta.`
      );
      prevSocket.disconnect(true);
      prevSocket.emit("force_disconnect", "Nueva sesión detectada");
    }
  }

  activeConnections.set(userId, socket);
  console.log(
    `[${new Date().toISOString()}] Usuarios activos: ${activeConnections.size}`
  );

  socket.on("disconnect", (reason) => {
    console.log(
      `[${new Date().toISOString()}] Usuario ${userId} desconectado. Razón: ${reason}`
    );
    if (activeConnections.get(userId) === socket) {
      activeConnections.delete(userId);
      console.log(
        `[${new Date().toISOString()}] Usuario ${userId} removido de conexiones activas.`
      );
    }
  });

  socket.on("error", (error) => {
    console.error(
      `[${new Date().toISOString()}] Error en socket usuario ${userId}:`,
      error
    );
  });
});

// Exportar la instancia de Socket.IO y el mapa de conexiones activas
module.exports = { io, app, httpServer, activeConnections };
