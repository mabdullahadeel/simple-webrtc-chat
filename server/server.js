require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

// Routes and handlers
app.get("/", (req, res) => {
  res.redirect("/server-health");
});
app.get("/server-health", (req, res) => {
  res.status(200).send("Server health is okay 👍");
});

// handling socket connetions for transeferring webrtc data
io.on("connection", (socket) => {
  console.log("a user connected with => ", socket.id);

  socket.emit("me", socket.id);

  // handle socket disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected => ", socket.id);
    socket.broadcast.emit("callended");
  });

  // Handle calling other user
  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("userCalling", { signalData, from, name });
  });

  // Handle Call acceptance
  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", {
      signalData: data.signal,
      name: data.name,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
