"use client";

import { useState } from "react";

export default function ChatBoxPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setAnswer("");
    const res = await fetch("/api/chatboxapi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded bg-white shadow">
      <h1 className="text-2xl font-bold mb-4">Ask about your Leads</h1>
      <textarea
        className="w-full border p-2 mb-2"
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question about your leads..."
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleAsk}
        disabled={loading || !question.trim()}
      >
        {loading ? "Thinking..." : "Ask"}
      </button>
      {answer && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Answer:</strong>
          <div>{answer}</div>
        </div>
      )}
    </div>
  );
}
