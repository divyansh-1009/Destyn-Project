import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { confession, userEmail } = await req.json();

  if (!confession || !userEmail) {
    return NextResponse.json(
      { error: "Missing confession or user email" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    const confessionDoc = {
      confession,
      userEmail, // Stored but not exposed in responses
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      reactions: {}, // emoji: [userEmail, ...]
    };

    const result = await db.collection("confessions").insertOne(confessionDoc);

    return NextResponse.json({
      success: true,
      confessionId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating confession:", error);
    return NextResponse.json(
      { error: "Failed to create confession" },
      { status: 500 }
    );
  }
}
