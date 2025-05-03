const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  updateNotification,
} = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware");

// Aplicar autenticación solo a las rutas que lo requieran
router.get("/api/notifications", authenticate, getNotifications);
router.post("/api/notifications", createNotification); // Esta ruta no requiere autenticación
router.patch("/api/notifications/:id", authenticate, updateNotification);

module.exports = router;
