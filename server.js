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
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle sending a message
    socket.on("chat message", async (data) => {
      // data: { room, sender, receiver, message, timestamp, status }
      try {
        const db = client.db("datingapp");
        const messageData = {
          ...data,
          status: "sent",
          createdAt: new Date().toISOString(),
        };

        const result = await db.collection("messages").insertOne(messageData);
        const savedMessage = { ...messageData, _id: result.insertedId };

        // Broadcast to room
        io.to(data.room).emit("chat message", savedMessage);
        console.log("Message sent to room:", data.room);

        // Update status to delivered after a short delay
        setTimeout(async () => {
          await db
            .collection("messages")
            .updateOne(
              { _id: result.insertedId },
              { $set: { status: "delivered" } }
            );
          io.to(data.room).emit("message status", {
            messageId: result.insertedId,
            status: "delivered",
          });
        }, 1000);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Typing indicators
    socket.on("typing", (data) => {
      socket.to(data.room).emit("typing", data);
    });

    socket.on("stop typing", (data) => {
      socket.to(data.room).emit("stop typing", data);
    });

    // Message reactions
    socket.on("add reaction", async (data) => {
      try {
        const db = client.db("datingapp");

        // Try to update by ObjectId first
        let updateResult;
        if (
          data.messageId &&
          require("mongodb").ObjectId.isValid(data.messageId)
        ) {
          updateResult = await db
            .collection("messages")
            .updateOne(
              { _id: new require("mongodb").ObjectId(data.messageId) },
              { $inc: { [`reactions.${data.reaction}`]: 1 } }
            );
        }

        // If not found by ObjectId, try to find by timestamp and message
        if (!updateResult || updateResult.matchedCount === 0) {
          const parts = data.messageId.split("-");
          if (parts.length >= 2) {
            const timestamp = parts[0];
            const message = parts.slice(1).join("-");

            updateResult = await db.collection("messages").updateOne(
              {
                timestamp: { $gte: new Date(parseInt(timestamp)) },
                message: message,
              },
              { $inc: { [`reactions.${data.reaction}`]: 1 } }
            );
          }
        }

        if (updateResult && updateResult.matchedCount > 0) {
          io.to(data.room).emit("reaction added", data);
        }
      } catch (error) {
        console.error("Error adding reaction:", error);
      }
    });

    // Mark message as read
    socket.on("mark read", async (data) => {
      try {
        const db = client.db("datingapp");
        await db.collection("messages").updateOne(
          { _id: data.messageId },
          {
            $set: {
              status: "read",
              readAt: new Date().toISOString(),
            },
          }
        );
        io.to(data.room).emit("message read", { messageId: data.messageId });
      } catch (error) {
        console.error("Error marking message as read:", error);
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
