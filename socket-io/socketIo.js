const { Server } = require("socket.io");
const express = require("express");
const { createServer } = require("http");
const allowedOrigins = require("../corsConfig");

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

module.exports = { io, app, httpServer };
