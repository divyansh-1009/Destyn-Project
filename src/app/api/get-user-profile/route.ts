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

    const userResponse = await db.collection("responses").findOne({ email });

    if (!userResponse) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract data from the answers object to create a clean profile
    const answers = userResponse.answers || {};

    // Construct the profile with data from the answers object
    const userProfile = {
      name: userResponse.name,
      email: userResponse.email,
      profilePhoto: answers.q0 || null,
      bio: answers.q1 || "",
      interests: answers.q2 || [],
      gender: answers.q3?.gender || "",
      preference: answers.q3?.preference || "",
      birthdate: answers.q3?.dob || "",
      // Include the answers for other fields
      answers: answers,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
