import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const client = await clientPromise;
  const db = client.db("datingapp");

  // Get the current user's preference
  const currentUser = await db.collection("responses").findOne({ email });
  if (!currentUser || !currentUser.preference) {
    return NextResponse.json({ users: [] });
  }

  // Exclude the current user and filter by gender matching preference
  const users = await db
    .collection("responses")
    .find({ email: { $ne: email }, gender: currentUser.preference })
    .project({ name: 1, email: 1, answers: 1, profilePhoto: 1, _id: 0 })
    .toArray();
  return NextResponse.json({ users });
}
