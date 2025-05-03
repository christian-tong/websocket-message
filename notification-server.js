const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createTables } = require("./config/dbConfig");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Llamar a la función que crea las tablas si no existen
createTables();

// Configuración de SQLite
const db = new sqlite3.Database(
  path.join(__dirname, "notifications.db"),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) console.error("Error opening database", err);
    else console.log("Connected to SQLite database");
  }
);

// Crear tabla de notificaciones (nueva estructura)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    message TEXT,
    data TEXT,
    reserva TEXT,
    status TEXT,
    timestamp TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Función para formatear timestamp
const getFormattedTimestamp = () => {
  const ahoraUTC = new Date();
  const offsetPeru = -5 * 60 * 60 * 1000;
  const fechaPeru = new Date(ahoraUTC.getTime() + offsetPeru);

  return [
    [
      fechaPeru.getUTCDate().toString().padStart(2, "0"),
      (fechaPeru.getUTCMonth() + 1).toString().padStart(2, "0"),
      fechaPeru.getUTCFullYear(),
    ].join("/"),
    [
      fechaPeru.getUTCHours().toString().padStart(2, "0"),
      fechaPeru.getUTCMinutes().toString().padStart(2, "0"),
      fechaPeru.getUTCSeconds().toString().padStart(2, "0"),
      ahoraUTC.getUTCMilliseconds().toString().padStart(4, "0"),
    ].join(":"),
  ].join("-");
};

// Nuevo endpoint GET para obtener todas las notificaciones
app.get("/api/notifications", (req, res) => {
  db.all("SELECT * FROM notifications", (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error al obtener notificaciones" });
    }

    const formattedNotifications = rows.map((row) => ({
      id: row.id,
      message: row.message,
      data: JSON.parse(row.data),
      reserva: JSON.parse(row.reserva),
      status: row.status,
      timestamp: row.timestamp,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    res.json(formattedNotifications);
  });
});

// Endpoint POST modificado para usar SQLite
app.post("/api/notifications", (req, res) => {
  const timestamp = getFormattedTimestamp();
  const newNotification = {
    id: uuidv4(),
    message: req.body.message,
    data: JSON.stringify(req.body.data),
    reserva: JSON.stringify(req.body.reserva),
    status: "pending",
    timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  };

  db.run(
    `INSERT INTO notifications 
    (id, message, data, reserva, status, timestamp, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newNotification.id,
      newNotification.message,
      newNotification.data,
      newNotification.reserva,
      newNotification.status,
      newNotification.timestamp,
      newNotification.created_at,
      newNotification.updated_at,
    ],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Error al crear notificación" });
      }

      db.get(
        "SELECT * FROM notifications WHERE id = ?",
        [newNotification.id],
        (err, row) => {
          if (err) {
            console.error("Database error:", err);
            return res
              .status(500)
              .json({ error: "Error al recuperar notificación" });
          }

          const notification = {
            ...row,
            data: JSON.parse(row.data),
            reserva: JSON.parse(row.reserva),
          };

          io.emit("new-notification", notification);
          res.status(201).json(notification);
        }
      );
    }
  );
});

app.patch("/api/notifications/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedAt = getFormattedTimestamp();

  db.run(
    "UPDATE notifications SET status = ?, updated_at = ? WHERE id = ?",
    [status, updatedAt, id],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ error: "Error al actualizar notificación" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Notificación no encontrada" });
      }

      db.get("SELECT * FROM notifications WHERE id = ?", [id], (err, row) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ error: "Error al recuperar notificación" });
        }

        const updatedNotification = {
          ...row,
          data: JSON.parse(row.data),
          reserva: JSON.parse(row.reserva),
        };

        io.emit("notification-updated", updatedNotification);
        res.json(updatedNotification);
      });
    }
  );
});

// Configuración del Socket.io
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Iniciar servidor
httpServer.listen(3001, () => {
  console.log("Server running on port 3001");
});
