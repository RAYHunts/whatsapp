const express = require("express");
const { Client } = require("whatsapp-web.js");
const client = new Client();
const port = process.env.PORT || 8888;
const socket = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.get("/", (req, res) => {
  req.status = 200;
  res.send("Hello World!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.initialize();

// io is the socket connection

server.listen(port, () => {
  console.log(`Server is running on port ${port} \n
                http://localhost:${port}`);
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
