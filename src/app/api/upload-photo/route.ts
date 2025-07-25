import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo") as File;
    const userEmail = formData.get("userEmail") as string;

    if (!file || !userEmail) {
      return NextResponse.json(
        { error: "Missing photo or user email" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "dating-app-profiles",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          }
        )
        .end(buffer);
    });

    // Save photo URL to MongoDB
    const client = await clientPromise;
    const db = client.db("datingapp");

    await db.collection("responses").updateOne(
      { email: userEmail },
      {
        $push: { profilePhotos: result.secure_url },
        $set: {
          profilePhoto: result.secure_url, // Keep for backward compatibility
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      photoUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
