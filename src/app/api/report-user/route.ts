import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { currentUserEmail, reportedUserEmail, reason } = await req.json();

    if (!currentUserEmail || !reportedUserEmail || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("datingapp");

    // Add report to reports collection
    await db.collection("reports").insertOne({
      reporterEmail: currentUserEmail,
      reportedUserEmail,
      reason,
      timestamp: new Date().toISOString(),
      status: "pending", // pending, reviewed, resolved
    });

    return NextResponse.json({
      success: true,
      message: "User reported successfully",
    });
  } catch (error) {
    console.error("Error reporting user:", error);
    return NextResponse.json(
      { error: "Failed to report user" },
      { status: 500 }
    );
  }
}
