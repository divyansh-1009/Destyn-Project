import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("datingapp");
    const user = await db.collection("responses").findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { isComplete: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check profile completion using just the answers object
    const isProfileComplete = checkProfileCompleteness(user);
    
    return NextResponse.json({ isComplete: isProfileComplete });
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return NextResponse.json(
      { error: "Failed to check profile completion" },
      { status: 500 }
    );
  }
}

// Helper function to check if the profile is complete
function checkProfileCompleteness(user: any): boolean {
  const answers = user.answers || {};
  
  // Check all required questions are answered
  // q0 = profile photo
  // q1 = bio
  // q2 = interests
  // q3 = gender/preference/birthdate
  // q4-q17 = remaining questions
  
  // Check profile photo (q0)
  if (!answers.q0) {
    return false;
  }
  
  // Check bio (q1)
  if (!answers.q1) {
    return false;
  }
  
  // Check interests (q2)
  if (!answers.q2 || !answers.q2.length) {
    return false;
  }
  
  // Check gender/preference/birthdate (q3)
  if (!answers.q3 || !answers.q3.gender || !answers.q3.preference || !answers.q3.dob) {
    return false;
  }
  
  // Check if remaining questions are answered (q4-q17)
  for (let i = 4; i <= 17; i++) {
    const qid = `q${i}`;
    if (!answers[qid]) {
      return false;
    }
  }
  
  return true;
}