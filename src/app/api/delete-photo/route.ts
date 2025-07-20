import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

function getCloudinaryPublicId(url: string) {
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
  // Extract everything after '/upload/' and before file extension
  const match = url.match(/\/upload\/(.*)(\.[a-zA-Z0-9]+)?$/);
  if (match && match[1]) {
    // Remove version if present (e.g., v1234567890/)
    return match[1].replace(/^v\d+\//, "").replace(/\.[a-zA-Z0-9]+$/, "");
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, photoUrl } = await req.json();
    if (!email || !photoUrl) {
      return NextResponse.json(
        { error: "Missing email or photoUrl" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("datingapp");

    // Remove photo from user's profilePhotos array
    await db.collection("responses").updateOne(
      { email },
      {
        $pull: { profilePhotos: photoUrl },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    // Delete from Cloudinary
    const publicId = getCloudinaryPublicId(photoUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
