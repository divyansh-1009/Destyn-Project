import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("datingapp");

    const userProfile = await db.collection("responses").findOne(
      { email },
      {
        projection: {
          name: 1,
          email: 1,
          profilePhoto: 1,
          profilePhotos: 1,
          answers: 1,
          bio: 1,
          interests: 1,
          birthdate: 1,
          education: 1,
          profession: 1,
          languages: 1,
          relationshipGoals: 1,
          lat: 1,
          lng: 1,
          location: 1,
          _id: 0,
        },
      }
    );

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
