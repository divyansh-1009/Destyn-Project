import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { reporterEmail, reportedUserEmail, confessionId, reason, details } = await req.json();
    if (!reporterEmail || (!reportedUserEmail && !confessionId) || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reporting:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 