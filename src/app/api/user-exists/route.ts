import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ exists: false });
  }
  const client = await clientPromise;
  const db = client.db("datingapp");
  const user = await db.collection("responses").findOne({ email });
  return NextResponse.json({ exists: !!user });
}