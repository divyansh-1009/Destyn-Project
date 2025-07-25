import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("datingapp");

    // Build $set object only with defined fields
    const allowedFields = [
      "name",
      "bio",
      "interests",
      "profilePhotos",
      "birthdate",
      "education",
      "profession",
      "languages",
      "relationshipGoals",
      "answers",
      "gender",
      "preference",
    ];
    const setObj: { [key: string]: any } = { updatedAt: new Date().toISOString() };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setObj[field] = body[field];
      }
    }

    await db.collection("responses").updateOne(
      { email },
      { $set: setObj }
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
