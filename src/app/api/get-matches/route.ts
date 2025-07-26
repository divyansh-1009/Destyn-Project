import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ newMatches: [], activeChats: [] });
  }
  const client = await clientPromise;
  const db = client.db("datingapp");

  try {
    // Get the list of users this user has liked
    const userLikesDoc = await db.collection("liked").findOne({ email });
    const userLikes = userLikesDoc?.liked || [];

    if (userLikes.length === 0) {
      return NextResponse.json({ newMatches: [], activeChats: [] });
    }

    // Find users who have liked this user back (mutual likes)
    const mutuals = await db
      .collection("liked")
      .find({ email: { $in: userLikes }, liked: email })
      .toArray();
    const matchedEmails = mutuals.map((doc) => doc.email);

    // Get user info for matched users (ensure unique emails)
    const uniqueMatchedEmails = [...new Set(matchedEmails)];
    const matchedUsers = await db
      .collection("responses")
      .find({ email: { $in: uniqueMatchedEmails } })
      .project({ name: 1, email: 1, profilePhoto: 1, _id: 0 })
      .toArray();

    // Separate new matches from active chats
    const newMatches = [];
    const activeChats = [];

    for (const user of matchedUsers) {
      const usersSorted = [email, user.email].sort();
      const room = usersSorted.join("--");
      
      // Check if both users have sent at least one message
      const messages = await db.collection("messages")
        .find({ 
          room,
          sender: { $ne: "system" } // Exclude system messages
        })
        .toArray();
      
      // Get unique senders (excluding system messages)
      const uniqueSenders = [...new Set(messages.map(msg => msg.sender))];
      const hasBothUsersMessaged = uniqueSenders.length >= 2;
      
      // Get match info and similarities
      const matchDoc = await db.collection("matches").findOne({ users: usersSorted });
      const userWithSimilarities = {
        ...user,
        similarInterests: matchDoc?.similarInterests || [],
        similarAnswers: matchDoc?.similarAnswers || [],
      };

      if (hasBothUsersMessaged) {
        activeChats.push(userWithSimilarities);
      } else {
        newMatches.push(userWithSimilarities);
      }
    }

    return NextResponse.json({ 
      newMatches, 
      activeChats 
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ newMatches: [], activeChats: [] });
  }
}
 