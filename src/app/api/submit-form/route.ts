import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { name, email, answers } = await req.json();
    if (!name || !email || !answers) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const client = await clientPromise;
    // Use the "datingapp" database
    const db = client.db("datingapp");
    await db.collection("responses").insertOne({
      name,
      email,
      answers,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}