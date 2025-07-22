import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const client = await clientPromise;
  const db = client.db("datingapp");
  // Exclude the current user
  const users = await db
    .collection("responses")
    .find({ email: { $ne: email } })
    .project({ name: 1, email: 1, answers: 1, profilePhoto: 1, _id: 0 })
    .toArray();
  return NextResponse.json({ users });
}
