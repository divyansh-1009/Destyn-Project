import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { currentUserEmail, likedUserEmail } = await req.json();
    if (!currentUserEmail || !likedUserEmail) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("datingapp");

    // Upsert: add likedUserEmail to the liked list for currentUserEmail
    await db.collection("liked").updateOne(
      { email: currentUserEmail },
      { $addToSet: { liked: likedUserEmail } }, // $addToSet avoids duplicates
      { upsert: true }
    );

    // Check if the liked user has already liked the current user (mutual like)
    const likedUserDoc = await db.collection("liked").findOne({ email: likedUserEmail });
    const likedUserLikes = likedUserDoc?.liked || [];
    let isMatch = false;
    if (likedUserLikes.includes(currentUserEmail)) {
      isMatch = true;
      // Fetch both user profiles
      const [user1, user2] = await Promise.all([
        db.collection("responses").findOne({ email: currentUserEmail }),
        db.collection("responses").findOne({ email: likedUserEmail })
      ]);
      const user1AnswersArr = Object.values(user1?.answers || {});
      const user2AnswersArr = Object.values(user2?.answers || {});
      // Compute similarities (only answers)
      const getSimilarities = (arr1: any[] = [], arr2: any[] = []) => arr1.filter((item) => arr2.includes(item));
      const similarAnswers = getSimilarities(user1AnswersArr, user2AnswersArr);
      // Store in matches collection (store both email orders for easy lookup)
      const matchDoc = {
        users: [currentUserEmail, likedUserEmail].sort(),
        similarAnswers,
        createdAt: new Date().toISOString(),
      };
      await db.collection("matches").updateOne(
        { users: matchDoc.users },
        { $set: matchDoc },
        { upsert: true }
      );
      // Create a system message for both users in the chat room
      const room = [currentUserEmail, likedUserEmail].sort().join("--");
      let sysMsg = '';
      if (similarAnswers.length > 0) {
        sysMsg += `👯‍♀️ Vibe check: You both answered ${similarAnswers.length} questions the same!\n`;
        sysMsg += similarAnswers.map(ans => `#${ans}`).join('  |  ') + '\n';
        sysMsg += `That's some real main character energy 🚀`;
      } else {
        sysMsg += `No twin answers yet, but who knows what the future holds? 🌈`;
      }
      await db.collection("messages").insertOne({
        room,
        sender: "system",
        receiver: null,
        message: sysMsg,
        timestamp: new Date().toISOString(),
        system: true
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}