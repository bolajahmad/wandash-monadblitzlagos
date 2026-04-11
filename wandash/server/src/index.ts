import express from "express";
import cors from "cors";
import http from "http";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { createLogger } from "./lib/logger";
import { errorHandler } from "./lib/error-handler";
import { gameRoutes } from "./modules/games";
import { initWebSocket } from "./websocket";
import { startGameScheduler } from "./workers";
import { shutdownRoundEngine } from "./modules/rounds";

const log = createLogger("Server");

const app = express();

// Middleware
app.use(cors({
  origin: env.corsOrigin.split(",").map(s => s.trim()),
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// REST routes
app.use("/api/games", gameRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = http.createServer(app);

async function start() {
  try {
    await prisma.$connect();
    log.info("Database connected");

    initWebSocket(server);
    // Start cron workers
    startGameScheduler();

    server.listen(env.port, () => {
      log.info(`Server running on port ${env.port}`);
      log.info(`WebSocket available at ws://localhost:${env.port}`);
    });
  } catch (err) {
    log.error("Failed to start server", err);
    process.exit(1);
  }
}

function shutdown(signal: string) {
  log.info(`${signal} received, shutting down...`)
  shutdownRoundEngine()

  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

// Graceful shutdown
process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

start();
