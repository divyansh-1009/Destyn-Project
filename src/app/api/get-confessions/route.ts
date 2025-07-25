import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get("skip") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const total = await db.collection("confessions").countDocuments();
    const confessions = await db
      .collection("confessions")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Remove userEmail from response to maintain anonymity and convert ObjectId to string
    const anonymousConfessions = confessions.map(
      ({ userEmail, _id, ...confession }) => ({
        ...confession,
        _id: _id.toString(), // Convert ObjectId to string
      })
    );

    return NextResponse.json({ confessions: anonymousConfessions, total });
  } catch (error) {
    console.error("Error fetching confessions:", error);
    return NextResponse.json({ confessions: [], total: 0 });
  }
}

// Helper to determine group
function getUserGroup(email: string) {
  email = email.toLowerCase();
  if (email.startsWith("b22") && email.endsWith("@iitj.ac.in")) return "b22";
  if (email.startsWith("b23") && email.endsWith("@iitj.ac.in")) return "b23";
  if (email.startsWith("b24") && email.endsWith("@iitj.ac.in")) return "b24";
  if (email.startsWith("b25") && email.endsWith("@iitj.ac.in")) return "b25";
  if (email === "rajuutate@gmail.com") return "b25";
  if (email.endsWith("@iitj.ac.in")) return "other-iitj";
  if (email.endsWith("@nlujodhpur.ac.in")) return "nlujodhpur";
  if (email.endsWith("@mbm.ac.in")) return "mbm";
  if (email.endsWith("@nift.ac.in")) return "nift";
  if (email.endsWith("@jietjodhpur.ac.in")) return "jietjodhpur";
  if (email.endsWith("@aiimsjodhpur.edu.in")) return "aiimsjodhpur";
  return "non-iitj";
}

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    const { email, skip = 0, limit = 10 } = await req.json();
    if (!email) return NextResponse.json({ confessions: [], total: 0 });
    const group = getUserGroup(email);

    // Fetch only confessions from the same group
    const total = await db.collection("confessions").countDocuments({ group });
    const confessions = await db
      .collection("confessions")
      .find({ group })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    // Remove userEmail from response to maintain anonymity and convert ObjectId to string
    const anonymousConfessions = confessions.map(
      ({ userEmail, _id, ...confession }) => ({
        ...confession,
        _id: _id.toString(),
      })
    );

    return NextResponse.json({ confessions: anonymousConfessions, total });
  } catch (error) {
    console.error("Error fetching confessions (POST):", error);
    return NextResponse.json({ confessions: [], total: 0 });
  }
}
