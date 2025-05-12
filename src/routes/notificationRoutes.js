//./src/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  updateNotification,
} = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware"); // Middleware para autenticar usuarios

/**
 * Ruta para obtener todas las notificaciones.
 * @route GET /api/notifications
 * @param {Object} req - Objeto de solicitud (no requiere parámetros).
 * @param {Object} res - Objeto de respuesta (contiene la lista de notificaciones).
 * @requires {authenticate} - Middleware para verificar el token JWT del usuario.
 */
router.get("/api/notifications", authenticate, getNotifications);

/**
 * Ruta para crear una nueva notificación.
 * @route POST /api/notifications
 * @param {Object} req - Objeto de solicitud (contiene los datos de la nueva notificación).
 * @param {Object} res - Objeto de respuesta (contiene la notificación creada).
 */
router.post("/api/notifications", createNotification); // Ruta sin autenticación

/**
 * Ruta para actualizar el estado de una notificación.
 * @route PATCH /api/notifications/:id
 * @param {Object} req - Objeto de solicitud (contiene el ID de la notificación y el nuevo estado).
 * @param {Object} res - Objeto de respuesta (contiene la notificación actualizada).
 * @requires {authenticate} - Middleware para verificar el token JWT del usuario.
 */
router.patch("/api/notifications/:id", authenticate, updateNotification);

module.exports = router;
