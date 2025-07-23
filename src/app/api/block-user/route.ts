import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { blockerEmail, blockedEmail, action } = await req.json();
    if (!blockerEmail) {
      return NextResponse.json({ error: "Missing blockerEmail" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");
    if (action === 'block') {
      await db.collection("blocked").updateOne(
        { email: blockerEmail },
        { $addToSet: { blocked: blockedEmail } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, action: 'blocked' });
    } else if (action === 'unblock') {
      await db.collection("blocked").updateOne(
        { email: blockerEmail },
        { $pull: { blocked: blockedEmail } }
      );
      return NextResponse.json({ success: true, action: 'unblocked' });
    } else if (action === 'get') {
      const doc = await db.collection("blocked").findOne({ email: blockerEmail });
      return NextResponse.json({ blocked: doc?.blocked || [] });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const blockerEmail = url.searchParams.get("blockerEmail");
    if (!blockerEmail) {
      return NextResponse.json({ error: "Missing blockerEmail" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");
    const doc = await db.collection("blocked").findOne({ email: blockerEmail });
    return NextResponse.json({ blocked: doc?.blocked || [] });
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 