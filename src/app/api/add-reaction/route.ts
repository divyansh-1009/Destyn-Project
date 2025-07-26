import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { confessionId, emoji, userEmail, action } = await req.json();
    if (!confessionId || !emoji || !userEmail || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");
    const confessionObjectId = new ObjectId(confessionId);
    if (action === 'add') {
      // Remove user from all emoji arrays first
      const confession = await db.collection("confessions").findOne({ _id: confessionObjectId });
      if (confession && confession.reactions) {
        const updates = [];
        for (const key of Object.keys(confession.reactions)) {
          updates.push(db.collection("confessions").updateOne(
            { _id: confessionObjectId },
            { $pull: { [`reactions.${key}`]: userEmail } }
          ));
        }
        await Promise.all(updates);
      }
      // Add user to the selected emoji
      await db.collection("confessions").updateOne(
        { _id: confessionObjectId },
        { $addToSet: { [`reactions.${emoji}`]: userEmail } }
      );
    } else {
      await db.collection("confessions").updateOne(
        { _id: confessionObjectId },
        { $pull: { [`reactions.${emoji}`]: userEmail } }
      );
    }
    const updated = await db.collection("confessions").findOne({ _id: confessionObjectId });
    return NextResponse.json({ success: true, reactions: updated?.reactions || {} });
  } catch (error) {
    console.error("Error updating reaction:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 