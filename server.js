// server.js
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const allowedOrigins = require("./corsConfig");
const { io, app, httpServer } = require("./socket-io/socketIo");
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
