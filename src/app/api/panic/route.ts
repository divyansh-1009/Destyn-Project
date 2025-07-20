import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, timestamp, location } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");

    // Get trusted contact
    const user = await db.collection("responses").findOne({ email });
    const trustedContact = user?.trustedContact || null;

    // Log panic event
    await db.collection("panic_events").insertOne({
      email,
      trustedContact,
      timestamp: timestamp || new Date().toISOString(),
      location: location || null,
      status: "triggered",
    });

    // TODO: Send email/SMS to trustedContact

    return NextResponse.json({ success: true, trustedContact });
  } catch (error) {
    console.error("Error handling panic alert:", error);
    return NextResponse.json(
      { error: "Failed to handle panic alert" },
      { status: 500 }
    );
  }
}
