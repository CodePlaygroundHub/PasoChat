import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import seedAIUser from "./seeds/seedAIUser.js";
import statusRoutes from "./routes/status.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportRoutes from "./routes/report.routes.js";

dotenv.config();

// const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "https://chat-app-sooty-mu.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

// app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../frontend", "dist", "index.html")
    );
  });
}

const startServer = async () => {
  await connectDB();
  await seedAIUser();

  server.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };