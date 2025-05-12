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

  console.log(`Nueva conexión para usuario: ${userId}`);

  // Verifica si el usuario ya tiene una conexión activa
  if (activeConnections.has(userId)) {
    const previousSocket = activeConnections.get(userId);

    if (!previousSocket.disconnected) {
      console.log(`Desconectando sesión anterior para usuario: ${userId}`);
      previousSocket.disconnect(true);
      previousSocket.emit("force_disconnect", "Nueva sesión detectada");
    }
  }

  // Almacena la nueva conexión
  activeConnections.set(userId, socket);
  console.log(
    `Usuario ${userId} conectado (${activeConnections.size} usuarios activos)`
  );

  socket.on("disconnect", (reason) => {
    activeConnections.delete(userId); // Elimina la conexión al desconectarse
    console.log(`Usuario ${userId} desconectado. Razón: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`Error en socket para usuario ${userId}:`, error);
  });
});

// Exportar la instancia de Socket.IO y el mapa de conexiones activas
module.exports = { io, app, httpServer, activeConnections };
