import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { messageId, reaction, userEmail } = await req.json();

    if (!reaction || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Adding reaction:", { messageId, reaction, userEmail });

    const client = await clientPromise;
    const db = client.db("datingapp");

    let updateResult;

    // Try to update by ObjectId first
    if (messageId && ObjectId.isValid(messageId)) {
      console.log("Trying to update by ObjectId:", messageId);
      updateResult = await db.collection("messages").updateOne(
        { _id: new ObjectId(messageId) },
        {
          $inc: { [`reactions.${reaction}`]: 1 },
          $set: { updatedAt: new Date().toISOString() },
        }
      );
      console.log("ObjectId update result:", updateResult);
    }

    // If not found by ObjectId, try to find by timestamp and message content
    if (!updateResult || updateResult.matchedCount === 0) {
      // Extract timestamp and message from the messageId (format: timestamp-message)
      const parts = messageId.split("-");
      if (parts.length >= 2) {
        const timestamp = parts[0];
        const message = parts.slice(1).join("-");

        console.log("Trying to update by timestamp and message:", {
          timestamp,
          message,
        });

        updateResult = await db.collection("messages").updateOne(
          {
            timestamp: { $gte: new Date(parseInt(timestamp)) },
            message: message,
          },
          {
            $inc: { [`reactions.${reaction}`]: 1 },
            $set: { updatedAt: new Date().toISOString() },
          }
        );
        console.log("Timestamp update result:", updateResult);
      }
    }

    if (!updateResult || updateResult.matchedCount === 0) {
      console.log("Message not found for reaction");
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    console.log("Reaction added successfully");
    return NextResponse.json({
      success: true,
      message: "Reaction added successfully",
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json(
      { error: "Failed to add reaction" },
      { status: 500 }
    );
  }
}
