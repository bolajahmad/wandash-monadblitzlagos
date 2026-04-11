import { WebSocketServer, WebSocket } from "ws"
import type { Server } from "http"
import { handleMessage, handleDisconnect } from "./handlers"
import { createLogger } from "../lib/logger"

const log = createLogger("WebSocket")

let wss: WebSocketServer

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server })

  wss.on("connection", (ws: WebSocket) => {
    log.debug("New WebSocket connection")

    ws.on("message", (data) => {
      const raw = data.toString()
      handleMessage(ws, raw).catch((err) => {
        log.error("Unhandled WS message error", err)
      })
    })

    ws.on("close", () => {
      handleDisconnect(ws).catch((err) => {
        log.error("Disconnect handler error", err)
      })
    })

    ws.on("error", (err) => {
      log.error("WebSocket error", err.message)
      handleDisconnect(ws).catch(() => {})
    })
  })

  log.info("WebSocket server initialized")
  return wss
}

export function getWss() {
  return wss
}

export { connectionMap } from "./connection-map"
export { WsMessageType } from "./messages"
