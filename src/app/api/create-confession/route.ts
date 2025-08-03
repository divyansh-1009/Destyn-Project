import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Helper to determine group
function getUserGroup(email: string) {
  email = email.toLowerCase();
  if (email.startsWith("b22") && email.endsWith("@iitj.ac.in")) return "b22";
  if (email.startsWith("b23") && email.endsWith("@iitj.ac.in")) return "b23";
  if (email.startsWith("b24") && email.endsWith("@iitj.ac.in")) return "b24";
  if (email.startsWith("b25") && email.endsWith("@iitj.ac.in")) return "b25";
  if (email === "rajuutate@gmail.com") return "b25";
  if (email === "divyakumar16072006@gmail.com") return "b24";
  if (email.endsWith("@iitj.ac.in")) return "other-iitj";
  if (email.endsWith("@nlujodhpur.ac.in")) return "nlujodhpur";
  if (email.endsWith("@mbm.ac.in")) return "mbm";
  if (email.endsWith("@nift.ac.in")) return "nift";
  if (email.endsWith("@jietjodhpur.ac.in")) return "jietjodhpur";
  if (email.endsWith("@aiimsjodhpur.edu.in")) return "aiimsjodhpur";
  return "non-iitj";
}

export async function POST(req: NextRequest) {
  const { confession, userEmail } = await req.json();

  if (!confession || !userEmail) {
    return NextResponse.json(
      { error: "Missing confession or user email" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    const group = getUserGroup(userEmail);
    const confessionDoc = {
      confession,
      userEmail, // Stored but not exposed in responses
      group, // Store group for efficient querying
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      reactions: {}, // emoji: [userEmail, ...]
    };

    const result = await db.collection("confessions").insertOne(confessionDoc);

    return NextResponse.json({
      success: true,
      confessionId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating confession:", error);
    return NextResponse.json(
      { error: "Failed to create confession" },
      { status: 500 }
    );
  }
}
