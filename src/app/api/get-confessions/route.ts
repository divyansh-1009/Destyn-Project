import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get("skip") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const total = await db.collection("confessions").countDocuments();
    const confessions = await db
      .collection("confessions")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Remove userEmail from response to maintain anonymity and convert ObjectId to string
    const anonymousConfessions = confessions.map(
      ({ userEmail, _id, ...confession }) => ({
        ...confession,
        _id: _id.toString(), // Convert ObjectId to string
      })
    );

    return NextResponse.json({ confessions: anonymousConfessions, total });
  } catch (error) {
    console.error("Error fetching confessions:", error);
    return NextResponse.json({ confessions: [], total: 0 });
  }
}
