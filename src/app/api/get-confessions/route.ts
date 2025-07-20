import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    const confessions = await db
      .collection("confessions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Remove userEmail from response to maintain anonymity and convert ObjectId to string
    const anonymousConfessions = confessions.map(
      ({ userEmail, _id, ...confession }) => ({
        ...confession,
        _id: _id.toString(), // Convert ObjectId to string
      })
    );

    return NextResponse.json({ confessions: anonymousConfessions });
  } catch (error) {
    console.error("Error fetching confessions:", error);
    return NextResponse.json({ confessions: [] });
  }
}
