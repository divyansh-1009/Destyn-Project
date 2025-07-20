import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ matches: [] });
  }
  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    // Get the list of users this user has liked
    const userLikesDoc = await db.collection("liked").findOne({ email });
    const userLikes = userLikesDoc?.liked || [];

    if (userLikes.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Find users who have liked this user back (mutual likes)
    const mutuals = await db
      .collection("liked")
      .find({ email: { $in: userLikes }, liked: email })
      .toArray();
    const matchedEmails = mutuals.map((doc) => doc.email);

    // Get user info for matched users (ensure unique emails)
    const uniqueMatchedEmails = [...new Set(matchedEmails)];
    const matchedUsers = await db
      .collection("responses")
      .find({ email: { $in: uniqueMatchedEmails } })
      .project({ name: 1, email: 1, profilePhoto: 1, _id: 0 })
      .toArray();

    return NextResponse.json({ matches: matchedUsers });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ matches: [] });
  }
}
 