const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const port = process.env.PORT || 8000;
const socket = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = socket(server);
const qrcode = require("qrcode");
const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // <- this one doesn't works in Windows
      "--disable-gpu",
    ],
  },
  authStrategy: new LocalAuth(),
});

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
    socket.emit("clientReady", true);
  });

  client.on("authenticated", () => {
    socket.emit("message", "Client authenticated");
  });

  client.on("auth_failure", (err) => {
    socket.emit("message", "Client authentication failed");
  });

  client.on("disconnected", () => {
    socket.emit("message", "Client disconnected");
    client.destroy();
    client.initialize();
  });
});

// app.post("/send-message", [
//   body('number').not().isEmpty().withMessage('Number is required'),
//   body('message').not().isEmpty().withMessage('Message is required'),
// ], async (req, res) => {
//   const errors = validationResult(req).formatWith(({ msg }) => msg);
//   if (!errors.isEmpty()) {
//     return res.status(422).json({ errors: errors.array() });
//   }
//   const { number, message } = req.body;
//   const localAuth = new LocalAuth(client);
//   const session = await localAuth.login();
//   const contact = await client.getContactById(number);
//   const messageId = await client.sendMessage(contact, message);
//   res.json({ messageId });

// });

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
