// ./server.js

require("dotenv").config();

// Manejadores globales para evitar que el servidor se bloquee por errores no capturados o promesas rechazadas
process.on("uncaughtException", (err) => {
  console.error(
    `[${new Date().toISOString()}] Excepción no capturada:`,
    err.stack
  );
  // No cerramos el servidor automáticamente para evitar cuelgues en producción
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`[${new Date().toISOString()}] Promesa no manejada:`, reason);
});

const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const authRoutes = require("./src/routes/authRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const allowedOrigins = require("./corsConfig");
const {
  io,
  app,
  httpServer,
  activeConnections,
} = require("./src/socket-io/socketIo"); // Asegúrate de importar correctamente

// Definir el puerto del servidor
const PORT = process.env.PORT || 3000;

/**
 * Configura y habilita CORS (Cross-Origin Resource Sharing) para permitir el acceso desde ciertos orígenes.
 * @param {Object} corsOptions - Opciones para la configuración de CORS.
 */
app.use(
  cors({
    origin: allowedOrigins, // Permite orígenes definidos en el archivo de configuración de CORS
    methods: ["GET", "POST", "PATCH"], // Métodos permitidos
    credentials: true, // Permite el uso de cookies
  })
);

// Usamos body-parser para parsear el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());

/**
 * Middleware para manejo de errores global en el servidor.
 * Si ocurre un error no manejado, responde con el error.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Algo salió mal en el servidor" });
});

/**
 * Rutas para autenticación y notificaciones
 * /api/auth - Maneja el login y registro de usuarios
 * /api/notifications - Maneja las operaciones de notificaciones
 */
app.use("/api/auth", authRoutes); // Ruta para autenticación
app.use(notificationRoutes); // Ruta para notificaciones

/**
 * Ruta para comprobar la salud del servidor (útil para monitoreo)
 */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/**
 * Inicia el servidor HTTP en el puerto definido.
 */
httpServer.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
