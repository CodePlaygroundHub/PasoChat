import { io } from "socket.io-client";

const TOTAL_USERS = 10000;

const sockets = [];

for (let i = 0; i < TOTAL_USERS; i++) {
  const socket = io("http://localhost:5001", {
    transports: ["websocket"],
    auth: {
      userId: `test-user-${i}`,
    },
  });

  socket.on("connect", () => {
    // reduce console spam
    if (i % 1000 === 0) {
      console.log(`${i} users connected`);
    }

    socket.emit("requestOnlineUsers");

    // only SOME users simulate activity
    if (i % 20 === 0) {
      setInterval(() => {
        socket.emit("typing", {
          to: "another-user",
        });

        setTimeout(() => {
          socket.emit("stopTyping", {
            to: "another-user",
          });
        }, 1000);
      }, 10000);
    }
  });

  socket.on("disconnect", () => {
    if (i % 1000 === 0) {
      console.log(`${i} users disconnected`);
    }
  });

  sockets.push(socket);
}

console.log(`Started ${TOTAL_USERS} users`);