//./src/controllers/notificationController.js
const { v4: uuidv4 } = require("uuid");
const { getConnection } = require("../config/dbConfig");
const { io } = require("../socket-io/socketIo");
const getFormattedTimestamp = require("../utils/formatDate");

/**
 * Obtiene todas las notificaciones de la base de datos.
 * @param {Object} req - Objeto de solicitud (no requiere parámetros).
 * @param {Object} res - Objeto de respuesta (contiene el listado de notificaciones).
 */
const getNotifications = async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute("SELECT * FROM notifications");

    // Formateamos las notificaciones
    const formattedNotifications = rows.map((row) => ({
      id: row.id,
      message: row.message,
      data: JSON.parse(row.data), // Parseamos los datos JSON
      reserva: JSON.parse(row.reserva), // Parseamos los datos de reserva
      status: row.status,
      timestamp: row.timestamp,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    res.json(formattedNotifications); // Devolvemos las notificaciones formateadas
  } catch (err) {
    console.error("Error al obtener notificaciones:", err);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

/**
 * Crea una nueva notificación en la base de datos y emite un evento a través de Socket.IO.
 * @param {Object} req - Objeto de solicitud (contiene los datos de la notificación).
 * @param {Object} res - Objeto de respuesta (contiene la notificación creada).
 */
const createNotification = async (req, res) => {
  const { message, data, reserva } = req.body;
  const timestamp = getFormattedTimestamp();
  const id = uuidv4(); // Generamos un nuevo UUID para la notificación

  try {
    const connection = await getConnection();

    const query = `
      INSERT INTO notifications (id, message, data, reserva, status, timestamp, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [
      id,
      message,
      JSON.stringify(data), // Convertimos los datos a string
      JSON.stringify(reserva),
      "pending", // Estado inicial de la notificación
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

    // Emitimos un evento a través de Socket.IO para notificar a los clientes
    io.emit("newNotification", newNotification);

    res.status(201).json(newNotification); // Respondemos con la notificación creada
  } catch (err) {
    console.error("Error al crear notificación:", err);
    res.status(500).json({ error: "Error al crear notificación" });
  }
};

/**
 * Actualiza el estado de una notificación existente en la base de datos.
 * @param {Object} req - Objeto de solicitud (contiene el ID de la notificación y el nuevo estado).
 * @param {Object} res - Objeto de respuesta (contiene la notificación actualizada).
 */
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

    // Recuperamos la notificación actualizada
    const [rows] = await connection.execute(
      "SELECT * FROM notifications WHERE id = ?",
      [id]
    );
    const updatedNotification = {
      ...rows[0],
      data: JSON.parse(rows[0].data),
      reserva: JSON.parse(rows[0].reserva),
    };

    // Emitimos un evento a través de Socket.IO para notificar a los clientes
    io.emit("notificationUpdated", updatedNotification);

    res.json(updatedNotification); // Respondemos con la notificación actualizada
  } catch (err) {
    console.error("Error al actualizar notificación:", err);
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};

module.exports = { getNotifications, createNotification, updateNotification };
