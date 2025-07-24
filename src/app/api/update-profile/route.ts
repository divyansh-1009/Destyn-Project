import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      name,
      bio,
      interests,
      profilePhotos,
      birthdate,
      education,
      profession,
      languages,
      relationshipGoals,
      answers,
      gender,
      preference,
    } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("datingapp");

    await db.collection("responses").updateOne(
      { email },
      {
        $set: {
          name,
          bio,
          interests,
          profilePhotos,
          birthdate,
          education,
          profession,
          languages,
          relationshipGoals,
          answers,
          gender,
          preference,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
