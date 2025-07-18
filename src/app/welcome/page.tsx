"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: "q1",
    question: "What is your favorite color?",
    options: ["Red", "Blue", "Green", "Yellow"],
  },
  {
    id: "q2",
    question: "Which season do you prefer?",
    options: ["Spring", "Summer", "Autumn", "Winter"],
  },
];

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session?.user) return null;

  const handleChange = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/submit-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: session.user.name,
        email: session.user.email,
        answers,
      }),
    });
    setSubmitted(true);
  };

  if (submitted) return <p>Thank you for submitting the form!</p>;

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 400, margin: "100px auto", textAlign: "left" }}
    >
      <h2>Welcome!</h2>
      <div>
        <label>Name:</label>
        <input value={session.user.name || ""} readOnly style={{ width: "100%" }} />
      </div>
      <div>
        <label>Email:</label>
        <input value={session.user.email || ""} readOnly style={{ width: "100%" }} />
      </div>
      {QUESTIONS.map((q) => (
        <div key={q.id} style={{ marginTop: 20 }}>
          <label>{q.question}</label>
          {q.options.map((opt) => (
            <div key={opt}>
              <input
                type="radio"
                name={q.id}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={() => handleChange(q.id, opt)}
                required
              />
              {opt}
            </div>
          ))}
        </div>
      ))}
      <button type="submit" style={{ marginTop: 30 }}>Submit</button>
    </form>
  );
}
