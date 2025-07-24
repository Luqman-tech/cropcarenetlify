import React, { useState } from "react";

const ResetPassword = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:4000/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setStep('reset');
      } else {
        setError(data.message || "Failed to request reset");
      }
    } catch (e) {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:4000/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful! You can now sign in.");
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (e) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="w-full max-w-xs bg-white/90 rounded-xl shadow-xl p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold text-green-800 mb-4">Reset Password</h2>
        {message && <div className="text-green-700 text-center mb-2">{message}</div>}
        {error && <div className="text-red-600 text-center mb-2">{error}</div>}
        {step === 'request' ? (
          <form onSubmit={handleRequest} className="w-full flex flex-col gap-3">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              disabled={loading}
            />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold" disabled={loading}>
              {loading ? "Requesting..." : "Request Reset Link"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="w-full flex flex-col gap-3">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Reset token (see email or server console)"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              disabled={loading}
            />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 