import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const client = await clientPromise;
  const db = client.db("datingapp");

  // Get the current user's preference from answers.q3
  const currentUser = await db.collection("responses").findOne({ email });
  if (!currentUser || !currentUser.answers?.q3?.preference) {
    return NextResponse.json({ users: [] });
  }

  // Get the user's preference from q3
  const userPreference = currentUser.answers.q3.preference;

  // Exclude the current user and filter by gender matching preference from q3
  const users = await db
    .collection("responses")
    .find({ 
      email: { $ne: email },
      "answers.q3.gender": userPreference // Match users whose gender matches the current user's preference
    })
    .project({ 
      name: 1, 
      email: 1, 
      answers: 1, 
      profilePhoto: 1,
      bio: 1,
      interests: 1,
      _id: 0 
    })
    .toArray();

  return NextResponse.json({ users });
}
