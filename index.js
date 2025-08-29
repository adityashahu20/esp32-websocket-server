const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

// ✅ store messages in memory
let history = [];

wss.on("connection", ws => {
  console.log("✅ Client connected");

  // send old messages to the new client
  history.forEach(msg => {
    ws.send(msg);
  });

  ws.on("message", msg => {
    console.log("📩 ESP32/browser says:", msg.toString());

    // add message to history
    history.push(msg.toString());

    // broadcast to everyone (including browsers)
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
