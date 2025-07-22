require("dotenv").config({ path: ".env.local" });

// Debug: Check if environment variables are loaded
console.log("Environment check:");
console.log("MONGODB_URI:", process.env.MONGODB_URI || "NOT FOUND");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "NOT FOUND");

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");
const { MongoClient } = require("mongodb");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = parseInt(process.env.PORT || "3000", 10);

// MongoDB connection - temporarily hardcoded for testing
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
console.log("Using MongoDB URI:", uri);

const client = new MongoClient(uri);
const clientPromise = client.connect();

app.prepare().then(() => {
  const server = express();

  // Add CORS middleware
  server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://10.22.16.34:3000",
        "http://0.0.0.0:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    // Join a room for private chat (room name could be a chatId or user pair)
    socket.on("join", (room) => {
      socket.join(room);
    });

    // Handle sending a message
    socket.on("chat message", async (data) => {
      // data: { room, sender, receiver, message, timestamp }
      try {
        const db = client.db("datingapp");
        await db.collection("messages").insertOne(data);
        io.to(data.room).emit("chat message", data); // Broadcast to room
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });

  // Fallback to Next.js request handler
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(PORT, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> Network access: http://0.0.0.0:${PORT}`);
  });
});
