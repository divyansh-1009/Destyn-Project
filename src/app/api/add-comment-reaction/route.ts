import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { confessionId, commentId, userEmail, action } = await req.json();
    if (!confessionId || !commentId || !userEmail || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("datingapp");
    const confessionObjectId = new ObjectId(confessionId);
    
    if (action === 'add') {
      // Add user to the comment's +1 reactions
      await db.collection("confessions").updateOne(
        { _id: confessionObjectId, "comments.id": commentId },
        { $addToSet: { "comments.$.reactions": userEmail } }
      );
    } else {
      // Remove user from the comment's +1 reactions
      await db.collection("confessions").updateOne(
        { _id: confessionObjectId, "comments.id": commentId },
        { $pull: { "comments.$.reactions": userEmail } }
      );
    }
    
    // Get the updated confession to return the new reactions
    const updated = await db.collection("confessions").findOne({ _id: confessionObjectId });
    const updatedComment = updated?.comments?.find((c: any) => c.id === commentId);
    
    return NextResponse.json({ 
      success: true, 
      reactions: updatedComment?.reactions || [] 
    });
  } catch (error) {
    console.error("Error updating comment reaction:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 