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

    // Fetch messages for this room
    const messages = await db
      .collection("messages")
      .find({ room })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ messages: [] });
  }
}
