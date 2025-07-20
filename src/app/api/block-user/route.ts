import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { currentUserEmail, blockedUserEmail } = await req.json();

    if (!currentUserEmail || !blockedUserEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("datingapp");

    // Add to blocked users list
    await db.collection("responses").updateOne(
      { email: currentUserEmail },
      {
        $addToSet: { blockedUsers: blockedUserEmail },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    return NextResponse.json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}
