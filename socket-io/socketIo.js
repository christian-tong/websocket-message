const { Server } = require("socket.io");
const express = require("express");
const { createServer } = require("http");
const allowedOrigins = require("../corsConfig");
const { verifyToken } = require("../services/authService"); // Importar el verificador de tokens

const app = express();
const httpServer = createServer(app);

// Mapa para almacenar las conexiones activas (userID -> socket)
const activeConnections = new Map();

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

// Middleware de autenticación para Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      throw new Error("Token no proporcionado");
    }

    // Verificar el token JWT
    const decoded = verifyToken(token);
    socket.userId = decoded.userId; // Adjuntar el ID de usuario al socket

    next();
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    next(new Error("Autenticación fallida"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;

  console.log(`Nueva conexión para usuario: ${userId}`);

  // Si el usuario ya tiene una conexión activa
  if (activeConnections.has(userId)) {
    const previousSocket = activeConnections.get(userId);
    console.log(`Desconectando sesión previa para usuario: ${userId}`);

    // Desconectar el socket anterior
    previousSocket.disconnect(true);

    // Enviar evento de desconexión al cliente anterior
    previousSocket.emit("force_disconnect", "Nueva sesión detectada");
  }

  // Almacenar la nueva conexión
  activeConnections.set(userId, socket);
  console.log(
    `Usuario ${userId} conectado (${activeConnections.size} usuarios activos)`
  );

  // Manejar desconexión
  socket.on("disconnect", (reason) => {
    if (activeConnections.get(userId) === socket) {
      activeConnections.delete(userId);
      console.log(`Usuario ${userId} desconectado. Razón: ${reason}`);
    }
  });

  // Manejar errores
  socket.on("error", (error) => {
    console.error(`Error en socket para usuario ${userId}:`, error);
  });
});

// Exportar el mapa de conexiones para acceso desde otros módulos
io.activeConnections = activeConnections;

module.exports = { io, app, httpServer, activeConnections };
