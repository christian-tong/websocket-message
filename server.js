// ./server.js
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

require("dotenv").config();

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

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Algo salió mal en el servidor" });
});

// Rutas de autenticación y notificaciones
app.use("/api/auth", authRoutes);
app.use(notificationRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
