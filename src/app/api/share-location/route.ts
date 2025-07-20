import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, location } = await req.json();
    if (!email || !location) {
      return NextResponse.json(
        { error: "Missing email or location" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("datingapp");

    // Get trusted contact
    const user = await db.collection("responses").findOne({ email });
    const trustedContact = user?.trustedContact || null;

    // Log location event
    await db.collection("location_shares").insertOne({
      email,
      trustedContact,
      location,
      timestamp: new Date().toISOString(),
      status: "active",
    });

    // TODO: Notify trusted contact (email/SMS)

    return NextResponse.json({ success: true, trustedContact });
  } catch (error) {
    console.error("Error sharing location:", error);
    return NextResponse.json(
      { error: "Failed to share location" },
      { status: 500 }
    );
  }
}
