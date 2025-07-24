import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Question {
  questionId: number;
  userId: number;
  questionText: string;
  timestamp: number;
  status: string;
  answerText: string;
  expertId: number | null;
}

const ExpertDashboard: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/expert/questions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data);
      } else {
        setError(data.message || "Failed to fetch questions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(questionId: number) {
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/expert/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ questionId, answerText })
      });
      const data = await res.json();
      if (res.ok) {
        setAnsweringId(null);
        setAnswerText("");
        fetchQuestions();
      } else {
        setError(data.message || "Failed to submit answer");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-800">Expert Dashboard</h1>
          <Button onClick={() => navigate("/home")} variant="outline" className="text-green-700 border-green-300 hover:bg-green-50">Home</Button>
        </div>
        {loading && <div>Loading questions...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {questions.length === 0 && !loading && <div>No open questions at the moment.</div>}
        <div className="space-y-6">
          {questions.map(q => (
            <Card key={q.questionId} className="bg-white/90">
              <CardHeader>
                <CardTitle>User Question</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-gray-800 font-medium">{q.questionText}</div>
                <div className="mb-2 text-xs text-gray-500">Asked: {new Date(q.timestamp).toLocaleString()}</div>
                {answeringId === q.questionId ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder="Type your answer here..."
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => submitAnswer(q.questionId)} disabled={submitting || !answerText}>
                        {submitting ? "Submitting..." : "Submit Answer"}
                      </Button>
                      <Button variant="outline" onClick={() => setAnsweringId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setAnsweringId(q.questionId)} variant="outline">
                    Answer
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard; 