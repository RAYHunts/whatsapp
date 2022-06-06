const express = require("express");
const { Client } = require("whatsapp-web.js");
const client = new Client();
const port = process.env.PORT || 8888;
const socket = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = socket(server);
const qrcode = require("qrcode");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

client.initialize();

// io is the socket connection
io.on("connection", (socket) => {
  socket.emit("message", "Connecttion established");
  client.on("qr", (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit("message", "QR code generated");
    });
  });
  client.on("ready", () => {
    socket.emit("message", "Client ready");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}\nhttp://localhost:${port}`);
});

client.on("message", (message) => {
  switch (message.type) {
    case "chat":
      switch (message.body) {
        case "ping":
          client.sendMessage(message.from, "pong");
          break;
        default:
          client.sendMessage(message.from, "Unknown command");
          break;
      }
      break;
  } // end switch
});
