// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const allowedOrigins = require("./corsConfig");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

// Configuración CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// Configuración de Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

// Conexión de cliente Socket.io
io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Rutas de autenticación y notificaciones
app.use("/api/auth", authRoutes);
app.use(notificationRoutes);

// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
