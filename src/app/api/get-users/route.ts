import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, ageRange, location, interests } = await req.json();

    const client = await clientPromise;
    const db = client.db("datingapp");

    // Get current user's blocked users
    const currentUser = await db.collection("responses").findOne({ email });
    const blockedUsers = currentUser?.blockedUsers || [];

    // Build query
    const query: any = {
      email: { $ne: email },
      email: { $nin: blockedUsers }, // Exclude blocked users
    };

    if (ageRange && ageRange.length === 2) {
      query.age = { $gte: ageRange[0], $lte: ageRange[1] };
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (interests && interests.length > 0) {
      query.interests = { $in: interests };
    }

    const users = await db
      .collection("responses")
      .find(query)
      .project({
        name: 1,
        email: 1,
        answers: 1,
        profilePhotos: 1,
        profilePhoto: 1,
        bio: 1,
        interests: 1,
        age: 1,
        location: 1,
        _id: 0,
      })
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
