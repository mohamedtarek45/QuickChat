import { createServer } from "node:http";
import { Server } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "8080", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const users = new Map();
  //   const httpServer = createServer(handle);
  const httpServer = createServer();
  httpServer.on("request", handle); // اجعل Next.js يتعامل مع الطلبات العادية
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // تأكد من السماح بجميع الطلبات
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log(`A user connected ${socket.id}`);
    socket.on("join-room", ({ room, userName }) => {
      const usersInRoom = [...users.values()].filter(
        (user) => user.room === room
      );
      const nameExists = usersInRoom.some((user) => user.userName === userName);
      if (nameExists) {
        socket.emit(
          "join-state",
          "This username is already taken in this room."
        );
        return;
      }
      socket.emit("join-state", "This username is valid");
      socket.join(room);
      users.set(socket.id, { userName, room });
      console.log(`User ${userName} joined room ${room}`);
      socket.to(room).emit("user-joined", `${userName} joined room `);
    });
    socket.on("message", ({ sender, room, message }) => {
      socket.to(room).emit("message", { sender, message });
    });

    socket.on("disconnect", () => {
      const user = users.get(socket.id);
      if (user) {
        const { userName, room } = user;
        socket.to(room).emit("message", {
          sender: "system",
          message: `${userName} left room`,
        });
        users.delete(socket.id); 
      }
    });
  });
  httpServer.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
});
