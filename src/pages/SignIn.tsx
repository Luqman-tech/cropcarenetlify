import React, { useState } from "react";
import { signIn, signUp } from "../lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SignIn: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let res;
    if (isSignUp) {
      res = await signUp(form.name, form.email, form.password, form.confirmPassword);
    } else {
      res = await signIn(form.email, form.password);
    }
    setLoading(false);
    if (res.success && res.token) {
      localStorage.setItem("token", res.token);
      window.location.href = "/home";
    } else {
      setError(res.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/90 shadow-xl border-0 flex flex-col items-center py-8 px-4">
        <CardContent className="w-full flex flex-col items-center justify-center p-0">
          <h2 className="text-2xl font-bold text-green-800 mb-4 text-center w-full">{isSignUp ? "Sign Up" : "Sign In"}</h2>
          {error && <div className="text-red-600 mb-2 text-center w-full text-sm font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            {isSignUp && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                disabled={loading}
                autoComplete="name"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              disabled={loading}
              autoComplete="email"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              disabled={loading}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            {isSignUp && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-green-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                disabled={loading}
                autoComplete="new-password"
              />
            )}
            <Button type="submit" className="w-full py-3 text-base rounded-lg mt-2" disabled={loading}>
              {loading ? (isSignUp ? "Signing Up..." : "Signing In...") : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
          </form>
          <div className="text-center w-full mt-4">
            <span className="text-gray-600 text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="ml-2 text-green-700 font-semibold hover:underline focus:outline-none"
                disabled={loading}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </span>
          </div>
          <div className="text-center w-full mt-2">
            <a href="/privacy" className="text-xs text-gray-500 underline hover:text-green-700">Privacy Policy</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn; 