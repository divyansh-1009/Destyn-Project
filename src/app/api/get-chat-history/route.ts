import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { userEmail, otherUserEmail } = await req.json();
  if (!userEmail || !otherUserEmail) {
    return NextResponse.json({ messages: [] });
  }

  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    // Create a consistent room name (sorted emails)
    const room = [userEmail, otherUserEmail].sort().join("--");

    console.log("Fetching chat history for room:", room);

    // Fetch messages for this room
    const messages = await db
      .collection("messages")
      .find({ room })
      .sort({ timestamp: 1 })
      .toArray();

    console.log(`Found ${messages.length} messages for room ${room}`);

    // Convert ObjectIds to strings for JSON serialization
    const serializedMessages = messages.map((msg) => ({
      ...msg,
      _id: msg._id ? msg._id.toString() : null,
      reactions: msg.reactions || {},
    }));

    return NextResponse.json({ messages: serializedMessages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ messages: [] });
  }
}
