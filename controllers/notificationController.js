// notificationController.js
const { v4: uuidv4 } = require("uuid");
const { getConnection } = require("../config/dbConfig");
const { io } = require("../socket-io/socketIo");
const getFormattedTimestamp = require("../utils/formatDate");

// Obtener todas las notificaciones
const getNotifications = async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute("SELECT * FROM notifications");
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
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

// Crear una nueva notificación
const createNotification = async (req, res) => {
  const { message, data, reserva } = req.body;
  const timestamp = getFormattedTimestamp();
  const id = uuidv4(); // Genera un nuevo UUID

  try {
    const connection = await getConnection();

    const query = `
      INSERT INTO notifications (id, message, data, reserva, status, timestamp, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [
      id,
      message,
      JSON.stringify(data),
      JSON.stringify(reserva),
      "pending",
      timestamp,
      timestamp,
      timestamp,
    ]);

    const newNotification = {
      id,
      message,
      data,
      reserva,
      status: "pending",
      timestamp,
      created_at: timestamp,
      updated_at: timestamp,
    };

    io.emit("newNotification", newNotification);

    res.status(201).json(newNotification);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error al crear notificación" });
  }
};

// Actualizar el estado de una notificación
const updateNotification = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedAt = new Date().toISOString();

  try {
    const connection = await getConnection();
    const query =
      "UPDATE notifications SET status = ?, updated_at = ? WHERE id = ?";
    const [result] = await connection.execute(query, [status, updatedAt, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM notifications WHERE id = ?",
      [id]
    );
    const updatedNotification = {
      ...rows[0],
      data: JSON.parse(rows[0].data),
      reserva: JSON.parse(rows[0].reserva),
    };

     io.emit("notificationUpdated", updatedNotification);

    res.json(updatedNotification);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

module.exports = { getNotifications, createNotification, updateNotification };
