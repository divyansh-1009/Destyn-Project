import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const userEmail = formData.get("userEmail") as string;

    if (!file || !userEmail) {
      return NextResponse.json(
        { error: "Missing image or user email" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Validate file size minimum (at least 1KB)
    const minSize = 1024; // 1KB in bytes
    if (file.size < minSize) {
      return NextResponse.json(
        { error: "File size must be at least 1KB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with feed-specific transformations
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "dating-app-feed",
            transformation: [
              { width: 800, height: 800, crop: "limit" }, // Max dimensions for feed
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

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading feed image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// Configure the API route for larger file uploads
export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
    responseLimit: false, // Disable response size limit
  },
  maxDuration: 60, // Allow up to 60 seconds for upload processing
}; 