import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ liked: [] });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");
    const doc = await db.collection("liked").findOne({ email });
    const liked = doc?.liked || [];
    return NextResponse.json({ liked });
  } catch (error) {
    console.error("Error fetching liked users:", error);
    return NextResponse.json({ liked: [] });
  }
}
