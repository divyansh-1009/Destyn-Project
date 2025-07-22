"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: "q1",
    question: "Which of these would you love doing with someone you vibe with?",
    options: [
      "Learning or working together",
      "Stargazing and deep convos",
      "Explore places and go on Trips",
      "Jamming"
    ],
  },
  {
    id: "q2",
    question: "What's your go-to comfort activity?",
    options: [
      "Gaming",
      "Reading",
      "Listening to music",
      "Watching shows",
      "Sleeping or just lying down"
    ],
  },
  {
    id: "q3",
    question: "Which kind of books or stories do you enjoy?",
    options: [
      "Self-improvement or psychology",
      "Mystery/thrillers",
      "Romance or slice-of-life",
      "I don't really read"
    ],
  },
  {
    id: "q4",
    question: "How do you usually respond to compliments?",
    options: [
      "Blush and get awkward",
      "Say thanks and move on",
      "Deny it even if I liked it",
      "Joke it off"
    ],
  },
  {
    id: "q5",
    question: "Which music vibe do you connect with most?",
    options: [
      "Rock / Metal – intense",
      "Lo-fi / Chill – relaxed, peaceful",
      "Pop / K-pop – upbeat",
      "Indie / Acoustic – emotional, thoughtful",
      "EDM / Dance – energy and movement"
    ],
  },
  {
    id: "q6",
    question: "What's your current relationship experience?",
    options: [
      "I've been in a serious relationship before",
      "I've dated casually",
      "I've never really dated",
      "I've only liked people from afar"
    ],
  },
  {
    id: "q7",
    question: "What kind of snacks do you usually reach for?",
    options: [
      "Sweet stuff",
      "Salty or spicy",
      "Healthy fruits",
      "I just need a drink (tea/coffee/energy drink)"
    ],
  },
  {
    id: "q8",
    question: "Pick the food that best matches your vibe:",
    options: [
      "Pizza — chill, classic, always a good time",
      "Ramen — warm, deep, and a bit mysterious",
      "Burgers — fun, messy, and full of surprises",
      "Dessert — sweet, soft, and makes people smile",
      "Healthy Bowl — focused, balanced, thoughtful"
    ],
  },
  {
    id: "q9",
    question: "Which sounds most like you?",
    options: [
      "Loyal and thoughtful",
      "Quiet and observant",
      "Funny",
      "Deep thinker with a big heart"
    ],
  },
  {
    id: "q10",
    question: "What kind of person are you drawn to?",
    options: [
      "Kind and supportive",
      "Smart and curious",
      "Funny and chill",
      "Creative or artistic"
    ],
  },
  {
    id: "q11",
    question: "When you like someone, how do you act?",
    options: [
      "I get nervous and quiet",
      "I try to help or support them",
      "I message them a lot",
      "I act normal and try not to show it"
    ],
  },
  {
    id: "q12",
    question: "How do you feel about personal space in a relationship?",
    options: [
      "I need a good amount of alone time",
      "I like being together, but need breaks",
      "I'd love to be around them a lot",
      "Haven't figured it out yet"
    ],
  },
  {
    id: "q13",
    question: "Which of these sounds like your vibe in a relationship?",
    options: [
      "A team that supports each other",
      "Two people growing together",
      "Just chill and fun with no drama",
      "Someone who respects my space and quiet"
    ],
  },
  {
    id: "q14",
    question: "How do you usually show someone that you like them?",
    options: [
      "I joke around with them",
      "I help them with stuff",
      "I send them memes or messages",
      "I get nervous and say nothing"
    ],
  }
];

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      background: "#000",
      color: "#fff"
    }}>
      <p>Loading...</p>
    </div>
  );
  
  if (!session?.user) return null;

  const handleChange = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session.user.name,
          email: session.user.email,
          answers,
        }),
      });
      router.push("/mainpage");
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  const currentQ = QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
  const canProceed = answers[currentQ.id];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "40px",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)"
      }}>
        {/* Progress Bar */}
        <div style={{
          background: "#f0f0f0",
          height: "8px",
          borderRadius: "4px",
          marginBottom: "30px",
          overflow: "hidden"
        }}>
          <div style={{
            background: "#667eea",
            height: "100%",
            width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
            transition: "width 0.3s ease"
          }} />
        </div>

        {/* Question Counter */}
        <div style={{
          textAlign: "center",
          color: "#666",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </div>

        {/* Question */}
        <h2 style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#333",
          marginBottom: "30px",
          textAlign: "center",
          lineHeight: "1.4"
        }}>
          {currentQ.question}
        </h2>

        {/* Options */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "40px"
        }}>
          {currentQ.options.map((opt) => (
            <label key={opt} style={{
              display: "flex",
              alignItems: "center",
              padding: "15px 20px",
              border: answers[currentQ.id] === opt ? "2px solid #667eea" : "2px solid #e0e0e0",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: answers[currentQ.id] === opt ? "#f8f9ff" : "#fff"
            }}>
              <input
                type="radio"
                name={currentQ.id}
                value={opt}
                checked={answers[currentQ.id] === opt}
                onChange={() => handleChange(currentQ.id, opt)}
                style={{
                  marginRight: "15px",
                  transform: "scale(1.2)"
                }}
              />
              <span style={{
                fontSize: "16px",
                color: "#333",
                lineHeight: "1.4"
              }}>
                {opt}
              </span>
            </label>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            style={{
              padding: "12px 24px",
              background: currentQuestion === 0 ? "#e0e0e0" : "#f0f0f0",
              color: currentQuestion === 0 ? "#999" : "#333",
              border: "none",
              borderRadius: "8px",
              cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500"
            }}
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              style={{
                padding: "12px 32px",
                background: canProceed && !isSubmitting ? "#667eea" : "#e0e0e0",
                color: canProceed && !isSubmitting ? "#fff" : "#999",
                border: "none",
                borderRadius: "8px",
                cursor: canProceed && !isSubmitting ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: "600"
              }}
            >
              {isSubmitting ? "Submitting..." : "Complete Profile"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              style={{
                padding: "12px 24px",
                background: canProceed ? "#667eea" : "#e0e0e0",
                color: canProceed ? "#fff" : "#999",
                border: "none",
                borderRadius: "8px",
                cursor: canProceed ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: "500"
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
