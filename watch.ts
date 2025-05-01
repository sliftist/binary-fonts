import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";

import { throttleFunction } from "socket-function/src/misc";

const WS_PORT = 3333;
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => {
        clients.delete(ws);
    });
});

// Function to run yarn start
function runYarnStart(): void {
    console.log("\nFile change detected, running yarn start...");
    try {
        execSync(`yarn start`, { stdio: "inherit" });
        // Notify all connected clients that build is complete
        for (const client of clients) {
            client.send(JSON.stringify({ type: "build_complete", timestamp: Date.now() }));
        }
    } catch (error) {
        // Even on build error, notify clients so they can show the error
        for (const client of clients) {
            client.send(JSON.stringify({ type: "build_error", timestamp: Date.now() }));
        }
        throw error;
    }
}

process.on("uncaughtException", (error) => {
    console.error(error);
});
process.on("unhandledRejection", (error) => {
    console.error(error);
});

// Throttled version that runs at most once per second
const throttledRun = throttleFunction(1000, runYarnStart);

console.log(`WebSocket server listening on port ${WS_PORT}`);
fs.watch(".", { recursive: true }, (eventType, filename) => {
    if (!filename) {
        return;
    }

    if (filename.includes("node_modules")) {
        return;
    }

    let included = filename.endsWith(".ts") || filename.endsWith(".html");

    if (!included) {
        return;
    }

    const fullPath = path.join(".", filename);
    if (!fs.existsSync(fullPath)) {
        return;
    }

    throttledRun();
});