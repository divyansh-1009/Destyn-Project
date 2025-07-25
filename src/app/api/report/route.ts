import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { reporterEmail, reportedUserEmail, confessionId, reason, details } = await req.json();
    if (!reporterEmail || (!reportedUserEmail && !confessionId) || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");

    // Prevent duplicate report for the same confession by the same user
    if (confessionId) {
      const existingReport = await db.collection("reports").findOne({
        reporterEmail,
        confessionId,
      });
      if (existingReport) {
        return NextResponse.json({ error: "You have already reported this gossip." }, { status: 409 });
      }
    }

    const reportDoc = {
      reporterEmail,
      reportedUserEmail: reportedUserEmail || null,
      confessionId: confessionId || null,
      reason,
      details: details || null,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    await db.collection("reports").insertOne(reportDoc);

    // If reporting a confession, check if it has 10 or more reports and delete if so
    if (confessionId) {
      const reportCount = await db.collection("reports").countDocuments({ confessionId });
      if (reportCount >= 10) {
        try {
          await db.collection("confessions").deleteOne({ _id: new ObjectId(confessionId) });
        } catch (err) {
          console.error("Error deleting confession after 10 reports:", err);
        }
      }
    }

    // If reporting a user (not just a confession), unmatch and delete chat
    if (reporterEmail && reportedUserEmail) {
      // Remove from liked collection for both users
      await db.collection("liked").updateOne(
        { email: reporterEmail },
        { $pull: { liked: reportedUserEmail } }
      );
      await db.collection("liked").updateOne(
        { email: reportedUserEmail },
        { $pull: { liked: reporterEmail } }
      );
      // Delete chat history for this room
      const room = [reporterEmail, reportedUserEmail].sort().join("--");
      await db.collection("messages").deleteMany({ room });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reporting:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 