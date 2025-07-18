import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { currentUserEmail, likedUserEmail } = await req.json();
    if (!currentUserEmail || !likedUserEmail) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");

    // Upsert: add likedUserEmail to the liked list for currentUserEmail
    await db.collection("liked").updateOne(
      { email: currentUserEmail },
      { $addToSet: { liked: likedUserEmail } }, // $addToSet avoids duplicates
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}