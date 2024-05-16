const { Server } = require("socket.io");

const express = require("express");
const app = express();
const port = 4000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("room:join", (data) => {
    console.log("room:join", data);
    const { email, room } = data;
    emailToSocketIdMap.set(email, room);
    socketIdToEmailMap.set(room, email);

    io.to(room).emit("user:joined", {
      email,
      id: socket.id,
    });

    socket.join(room);

    io.to(socket.id).emit("room:join", { email, room });
  });

  socket.on("get:userCount", (room) => {
    const userCount = io.sockets.adapter.rooms.get(room);
    console.log("userCount", userCount?.size);
    io.to(room).emit("user:count", { userCount: userCount?.size });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
