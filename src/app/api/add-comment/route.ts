import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const { confessionId, comment, userEmail, userName } = await req.json();

  if (!confessionId || !comment || !userEmail || !userName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    const commentDoc = {
      id: new Date().getTime().toString(), // Simple unique ID
      comment,
      userEmail,
      userName,
      createdAt: new Date().toISOString(),
    };

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(confessionId);
    } catch (error) {
      console.error("Invalid ObjectId:", confessionId, error);
      return NextResponse.json(
        { error: "Invalid confession ID" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("confessions")
      .updateOne({ _id: objectId }, { $push: { comments: commentDoc } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Confession not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
